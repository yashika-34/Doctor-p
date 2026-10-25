// Configuration for API Base URL
// Supports local development, custom host, and deployed Render/Vercel endpoints
const API_BASE_URL = (() => {
  if (window.DOCTORP_API_URL) {
    return window.DOCTORP_API_URL;
  }
  // If served directly from Express server:
  if (window.location.port === '5000') {
    return '/api';
  }
  // If served via Vite/Live Server on port 5173 / 3000 / 5500:
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5000/api';
  }
  // Production fallback (Render API or current origin)
  return '/api';
})();

window.API_BASE_URL = API_BASE_URL;
