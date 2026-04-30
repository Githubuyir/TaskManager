import api from './api';

export const authService = {
  login: async (credentials: any) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  
  signup: async (userData: any) => {
    const response = await api.post('/auth/signup', userData);
    return response.data;
  },

  googleAuth: async (idToken: string) => {
    const response = await api.post('/auth/google', { idToken });
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};
