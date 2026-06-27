import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.DEV ? "http://localhost:3000" : "",
  timeout: 10000,
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    // If we get a 401, the token is invalid or expired
    // AuthContext will handle the redirect on ProtectedRoute
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
    }
    return Promise.reject(error);
  }
);

export default client;