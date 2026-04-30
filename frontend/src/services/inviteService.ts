import api from './api';

export const inviteService = {
  createInvite: async (email: string) => {
    const response = await api.post('/invites', { email });
    return response.data;
  },
  
  getInvite: async (token: string) => {
    const response = await api.get(`/invites/${token}`);
    return response.data;
  },

  acceptInvite: async (data: any) => {
    const response = await api.post('/invites/accept', data);
    return response.data;
  }
};
