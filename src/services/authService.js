import { API } from '@/config';
const API_BASE_URL = `${API.MAIN}/api/v1/auth`;

export const signup = async (userData) => {
  const response = await fetch(`${API_BASE_URL}/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: userData.name,
      countryCode: userData.countryCode || '+91',
      mobileNumber: userData.mobileNumber,
      password: userData.password
    })
  });

  return response.json();
};

export const signin = async (credentials) => {
  const response = await fetch(`${API_BASE_URL}/signin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      countryCode: credentials.countryCode || '+91',
      mobileNumber: credentials.mobileNumber,
      password: credentials.password
    })
  });

  return response.json();
};

export const handleGoogleAuth = async (userInfo, accessToken) => {
  const response = await fetch(`${API_BASE_URL}/google`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: userInfo.email,
      googleId: userInfo.sub,
      name: userInfo.name,
      picture: userInfo.picture,
      token: accessToken
    })
  });

  return response.json();
};
