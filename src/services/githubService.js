import { baseURL, getUserInfo } from "../utilities";
import { API } from '@/config';

const getApiBaseUrl = () => {
  const base = API.GITHUB || API.MAIN || baseURL || '';
  return `${base}/api/v1/github`;
};

/**
 * Extracts dynamic credentials from the active user's session data or local storage.
 */
const getDynamicCreds = () => {
  const userInfo = getUserInfo() || {};
  const storedUserId = localStorage.getItem("userId") || sessionStorage.getItem("userId");
  const storedToken = localStorage.getItem("githubToken") || sessionStorage.getItem("githubToken");
  const storedOwner = localStorage.getItem("githubOwner") || sessionStorage.getItem("githubOwner");
  return {
    userId: userInfo.userId || userInfo._id || userInfo.id || storedUserId || "",
    githubToken: userInfo.githubToken || storedToken || "",
    owner: userInfo.githubUsername || userInfo.owner || storedOwner || ""
  };
};

const handleApiResponse = async (response, fallbackMsg) => {
  let data;
  try {
    data = await response.json();
  } catch (e) {
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    return {};
  }
  if (!response.ok || data?.status === 'error') {
    throw new Error(data?.message || data?.error || fallbackMsg);
  }
  return data;
};

export const checkGithubConnection = async (userIdOverride) => {
  const { userId } = getDynamicCreds();
  const activeUserId = userIdOverride || userId;

  const response = await fetch(`${getApiBaseUrl()}/check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: activeUserId })
  });
  return handleApiResponse(response, 'Failed to check GitHub connection');
};

export const getGithubRepos = async (userIdOverride) => {
  const { userId } = getDynamicCreds();
  const activeUserId = userIdOverride || userId;

  const response = await fetch(`${getApiBaseUrl()}/repos?userId=${activeUserId}`, {
    method: 'GET'
  });
  return handleApiResponse(response, 'Failed to fetch repositories');
};

export const createGithubRepo = async (repoName, branch = 'main', userIdOverride, githubTokenOverride, ownerOverride) => {
  const creds = getDynamicCreds();
  const userId = userIdOverride || creds.userId;
  const githubToken = githubTokenOverride || creds.githubToken;
  const owner = ownerOverride || creds.owner;

  const response = await fetch(`${getApiBaseUrl()}/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      githubToken,
      owner,
      repoName,
      branch,
      createIfNotExists: true
    })
  });
  return handleApiResponse(response, 'Failed to create/link repository');
};

export const connectGithubRepo = async (repoName, branch = 'main', userIdOverride, githubTokenOverride, ownerOverride) => {
  const creds = getDynamicCreds();
  const userId = userIdOverride || creds.userId;
  const githubToken = githubTokenOverride || creds.githubToken;
  const owner = ownerOverride || creds.owner;

  const response = await fetch(`${getApiBaseUrl()}/connect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      githubToken,
      owner,
      repoName,
      branch,
      createIfNotExists: true
    })
  });
  return handleApiResponse(response, 'Failed to connect repository');
};

export const pushToGithub = async (files, message, userIdOverride) => {
  const { userId } = getDynamicCreds();
  const activeUserId = userIdOverride || userId;

  const normalizedFiles = (files || []).map(f => ({
    ...f,
    path: f.path || f.Path,
    content: f.content || ''
  }));

  const response = await fetch(`${getApiBaseUrl()}/push`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: activeUserId,
      files: normalizedFiles,
      message
    })
  });
  return handleApiResponse(response, 'Failed to push code');
};

export const reconnectGithub = async (userIdOverride, githubTokenOverride) => {
  const creds = getDynamicCreds();
  const userId = userIdOverride || creds.userId;
  const githubToken = githubTokenOverride || creds.githubToken;

  const response = await fetch(`${getApiBaseUrl()}/reconnect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      githubToken
    })
  });
  return handleApiResponse(response, 'Failed to reconnect GitHub');
};

