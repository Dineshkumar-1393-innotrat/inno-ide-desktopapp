import { baseURL } from "../utilities";

const SHARE_API_URL = `${baseURL}/api/v1/share`;

/**
 * Invite users to the project via emails
 * @param {Array<string>} emails - Array of email addresses to invite
 * @param {string} link - The project link
 * @returns {Promise<any>} Response from the server
 */
export const inviteUsers = async (emails, link) => {
  const response = await fetch(`${SHARE_API_URL}/invite`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ emails, link })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Failed to send invites');
  }

  return response.json();
};
