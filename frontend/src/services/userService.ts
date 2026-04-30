import api from './api';

export const userService = {
  getWorkspaceMembers: async () => {
    const response = await api.get('/users/workspace-members');
    return response.data;
  },

  removeMember: async (userId: string) => {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  },

  updateMemberRole: async (userId: string, role: 'admin' | 'member') => {
    const response = await api.put(`/users/${userId}/role`, { role });
    return response.data;
  },

  getWorkspaceSettings: async () => {
    const response = await api.get('/users/workspace-settings');
    return response.data;
  },

  updateWorkspaceSettings: async (data: { name?: string; description?: string }) => {
    const response = await api.put('/users/workspace-settings', data);
    return response.data;
  },

  updateProfile: async (data: { name: string }) => {
    const response = await api.put('/users/profile', data);
    return response.data;
  },

  changePassword: async (data: any) => {
    const response = await api.put('/users/change-password', data);
    return response.data;
  }
};
