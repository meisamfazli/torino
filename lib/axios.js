import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:6501',
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== 'undefined') {
      const status = error.response?.status;
      const message = error.response?.data?.message;
      const invalidToken = status === 401 || (status === 403 && message === 'Invalid token');

      if (invalidToken && localStorage.getItem('accessToken')) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('torinoMobile');
        window.dispatchEvent(new Event('torino-auth-change'));
      }
    }

    return Promise.reject(error);
  },
);

export default api;
