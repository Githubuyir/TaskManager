import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { userService } from '../../services/userService';
import { Button } from '../../components/ui';
import toast from 'react-hot-toast';

const SettingsPage = () => {
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isSavingWorkspace, setIsSavingWorkspace] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Form states
  const [workspace, setWorkspace] = useState({ name: '', description: '' });
  const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [profileName, setProfileName] = useState(user?.name || '');

  // Password visibility states
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchWorkspaceSettings();
    }
  }, [user]);

  const fetchWorkspaceSettings = async () => {
    try {
      setIsLoading(true);
      const data = await userService.getWorkspaceSettings();
      setWorkspace({ name: data.name || '', description: data.description || '' });
    } catch (error) {
      console.error('Failed to fetch workspace settings', error);
      toast.error('Failed to load workspace settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWorkspaceSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspace.name.trim()) {
      toast.error('Workspace name is required');
      return;
    }
    
    try {
      setIsSavingWorkspace(true);
      await userService.updateWorkspaceSettings(workspace);
      toast.success('Workspace settings updated');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update workspace');
    } finally {
      setIsSavingWorkspace(false);
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) {
      toast.error('Name is required');
      return;
    }

    try {
      setIsSavingProfile(true);
      await userService.updateProfile({ name: profileName });
      updateUser({ name: profileName });
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    try {
      setIsSavingPassword(true);
      await userService.changePassword(passwords);
      toast.success('Password changed successfully');
      setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setIsSavingPassword(false);
    }
  };

  if (isLoading) {
    return <div className="animate-pulse space-y-4">Loading settings...</div>;
  }

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 max-w-3xl">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-brand-on-background">Settings</h1>
        <p className="text-brand-on-surface-variant flex items-center gap-2 mt-2">
          <span className="material-symbols-outlined text-[18px]">badge</span>
          Current Role: <span className="font-bold text-brand-primary capitalize">{user?.role}</span>
        </p>
      </div>

      {user?.role === 'admin' && (
        <div className="bg-brand-surface-container-lowest rounded-brand-2xl p-6 shadow-sm ring-1 ring-brand-outline-variant/10">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-brand-outline-variant/10">
            <span className="material-symbols-outlined text-brand-primary text-xl">domain</span>
            <h2 className="text-lg font-bold text-brand-on-surface">Workspace Settings</h2>
          </div>
          
          <form onSubmit={handleWorkspaceSave} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-brand-on-surface-variant ml-1 mb-1.5">
                Workspace Name
              </label>
              <input
                type="text"
                value={workspace.name}
                onChange={(e) => setWorkspace({ ...workspace, name: e.target.value })}
                className="w-full bg-brand-surface-container-low px-4 py-3 rounded-brand-xl text-sm border border-brand-outline-variant/10 focus:ring-2 focus:ring-brand-primary/20 outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-brand-on-surface-variant ml-1 mb-1.5">
                Description
              </label>
              <textarea
                value={workspace.description}
                onChange={(e) => setWorkspace({ ...workspace, description: e.target.value })}
                className="w-full bg-brand-surface-container-low px-4 py-3 rounded-brand-xl text-sm border border-brand-outline-variant/10 focus:ring-2 focus:ring-brand-primary/20 outline-none min-h-[80px]"
              />
            </div>
            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={isSavingWorkspace} className="btn-primary-gradient">
                {isSavingWorkspace ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-brand-surface-container-lowest rounded-brand-2xl p-6 shadow-sm ring-1 ring-brand-outline-variant/10">
        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-brand-outline-variant/10">
          <span className="material-symbols-outlined text-brand-secondary text-xl">person</span>
          <h2 className="text-lg font-bold text-brand-on-surface">User Profile</h2>
        </div>
        
        <form onSubmit={handleProfileSave} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-brand-on-surface-variant ml-1 mb-1.5">
              Name
            </label>
            <input
              type="text"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              className="w-full bg-brand-surface-container-low px-4 py-3 rounded-brand-xl text-sm border border-brand-outline-variant/10 focus:ring-2 focus:ring-brand-primary/20 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-brand-on-surface-variant ml-1 mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={user?.email || ''}
              readOnly
              className="w-full bg-brand-surface-container-low/50 text-brand-on-surface-variant px-4 py-3 rounded-brand-xl text-sm border border-brand-outline-variant/5 cursor-not-allowed"
            />
          </div>
          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={isSavingProfile} className="btn-primary-gradient">
              {isSavingProfile ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>

      <div className="bg-brand-surface-container-lowest rounded-brand-2xl p-6 shadow-sm ring-1 ring-brand-outline-variant/10">
        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-brand-outline-variant/10">
          <span className="material-symbols-outlined text-brand-error text-xl">lock</span>
          <h2 className="text-lg font-bold text-brand-on-surface">Change Password</h2>
        </div>
        
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-brand-on-surface-variant ml-1 mb-1.5">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showOldPassword ? "text" : "password"}
                value={passwords.oldPassword}
                onChange={(e) => setPasswords({ ...passwords, oldPassword: e.target.value })}
                className="w-full bg-brand-surface-container-low px-4 py-3 pr-10 rounded-brand-xl text-sm border border-brand-outline-variant/10 focus:ring-2 focus:ring-brand-error/20 outline-none focus:border-brand-error/30"
                required
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-on-surface-variant hover:text-brand-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showOldPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-brand-on-surface-variant ml-1 mb-1.5">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                  className="w-full bg-brand-surface-container-low px-4 py-3 pr-10 rounded-brand-xl text-sm border border-brand-outline-variant/10 focus:ring-2 focus:ring-brand-error/20 outline-none focus:border-brand-error/30"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-on-surface-variant hover:text-brand-on-surface"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showNewPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-brand-on-surface-variant ml-1 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                  className="w-full bg-brand-surface-container-low px-4 py-3 pr-10 rounded-brand-xl text-sm border border-brand-outline-variant/10 focus:ring-2 focus:ring-brand-error/20 outline-none focus:border-brand-error/30"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-on-surface-variant hover:text-brand-on-surface"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showConfirmPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={isSavingPassword} className="bg-brand-error hover:bg-brand-error/90 text-white">
              {isSavingPassword ? 'Updating...' : 'Update Password'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;
