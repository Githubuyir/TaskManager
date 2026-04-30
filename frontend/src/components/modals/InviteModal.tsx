import { useState } from 'react';
import { Button, Input } from '../ui';
import { inviteService } from '../../services/inviteService';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const InviteModal = ({ isOpen, onClose, onSuccess }: InviteModalProps) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      setIsLoading(true);
      await inviteService.createInvite(email);
      setSuccess(`Invitation email sent to ${email} successfully!`);
      setEmail('');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send invite');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setError('');
    setSuccess('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-brand-surface rounded-brand-2xl w-full max-w-md p-8 shadow-2xl ring-1 ring-white/10 animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black tracking-tight text-brand-on-surface">Invite Member</h2>
          <button onClick={handleClose} className="p-2 hover:bg-brand-surface-container-high rounded-full transition-colors">
            <span className="material-symbols-outlined text-brand-on-surface-variant">close</span>
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-brand-xl text-sm font-medium flex items-start gap-3">
            <span className="material-symbols-outlined text-[18px] mt-0.5 flex-shrink-0">error</span>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-600 rounded-brand-xl text-sm font-medium flex items-start gap-3">
            <span className="material-symbols-outlined text-[18px] mt-0.5 flex-shrink-0 filled">check_circle</span>
            <div>
              <p className="font-bold">{success}</p>
              <p className="text-xs mt-1 text-green-500">The member will receive an email with a link to join your workspace.</p>
            </div>
          </div>
        )}

        {!success ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-brand-surface-container-low p-4 rounded-brand-xl ring-1 ring-brand-outline-variant/5 mb-2">
              <div className="flex items-center gap-3 mb-2">
                <span className="material-symbols-outlined text-brand-primary text-[20px]">mail</span>
                <p className="text-xs font-bold text-brand-on-surface">How it works</p>
              </div>
              <p className="text-[11px] text-brand-on-surface-variant leading-relaxed ml-8">
                An invitation email will be sent via SendGrid. The member clicks the link, creates their account, and joins your workspace automatically.
              </p>
            </div>

            <Input
              label="Email Address"
              placeholder="colleague@company.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div className="pt-2">
              <Button type="submit" disabled={isLoading} className="w-full btn-primary-gradient shadow-lg shadow-brand-primary/20">
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></span>
                    Sending Invite...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">send</span>
                    Send Invitation Email
                  </span>
                )}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <Button
              onClick={() => {
                setSuccess('');
                setEmail('');
              }}
              variant="secondary"
              className="w-full gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              Invite Another Member
            </Button>
            <Button onClick={handleClose} className="w-full">
              Done
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
