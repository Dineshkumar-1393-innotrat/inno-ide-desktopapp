const required = [
  "VITE_API_BASE_URL",
  "VITE_ADMIN_API_BASE_URL",
  "VITE_GITHUB_API_BASE_URL",
  "VITE_CLOUDINARY_URL"
];

required.forEach((key) => {
  if (!import.meta.env[key]) {
    console.warn(`Missing environment variable: ${key}`);
  }
});

export default {};
