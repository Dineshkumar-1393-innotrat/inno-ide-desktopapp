import { baseURL, getUserInfo } from "../utilities";
import { API } from '@/config';

const API_BASE_URL = `${API.GITHUB}/api/v1/github`;

// Fallback values for testing if user is not logged in or doesn't have github setup
// const DEFAULT_USER_ID = "";
// const DEFAULT_TOKEN = "";
// const DEFAULT_OWNER = "";

/**
 * Extracts dynamic credentials from the active user's session data.
 */
const getDynamicCreds = () => {
  const userInfo = getUserInfo() || {};
  return {
    userId: userInfo.userId || userInfo._id || "",
    githubToken: userInfo.githubToken || "",
    owner: userInfo.githubUsername || userInfo.owner || ""
  };
};

export const checkGithubConnection = async (userIdOverride) => {
  const { userId } = getDynamicCreds();
  const activeUserId = userIdOverride || userId;

  const response = await fetch(`${API_BASE_URL}/check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: activeUserId })
  });
  return response.json();
};

export const getGithubRepos = async (userIdOverride) => {
  const { userId } = getDynamicCreds();
  const activeUserId = userIdOverride || userId;

  const response = await fetch(`${API_BASE_URL}/repos?userId=${activeUserId}`, {
    method: 'GET'
  });
  return response.json();
};

export const createGithubRepo = async (repoName, branch = 'main', userIdOverride, githubTokenOverride, ownerOverride) => {
  const creds = getDynamicCreds();
  const userId = userIdOverride || creds.userId;
  const githubToken = githubTokenOverride || creds.githubToken;
  const owner = ownerOverride || creds.owner;

  const response = await fetch(`${API_BASE_URL}/create`, {
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
  return response.json();
};

export const connectGithubRepo = async (repoName, branch = 'main', userIdOverride, githubTokenOverride, ownerOverride) => {
  const creds = getDynamicCreds();
  const userId = userIdOverride || creds.userId;
  const githubToken = githubTokenOverride || creds.githubToken;
  const owner = ownerOverride || creds.owner;

  const response = await fetch(`${API_BASE_URL}/connect`, {
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
  return response.json();
};

export const pushToGithub = async (files, message, userIdOverride) => {
  const { userId } = getDynamicCreds();
  const activeUserId = userIdOverride || userId;

  const response = await fetch(`${API_BASE_URL}/push`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: activeUserId,
      files,
      message
    })
  });
  return response.json();
};

export const reconnectGithub = async (userIdOverride, githubTokenOverride) => {
  const creds = getDynamicCreds();
  const userId = userIdOverride || creds.userId;
  const githubToken = githubTokenOverride || creds.githubToken;

  const response = await fetch(`${API_BASE_URL}/reconnect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      githubToken
    })
  });
  return response.json();
};
