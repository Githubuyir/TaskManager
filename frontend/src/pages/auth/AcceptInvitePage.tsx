import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Input } from '../../components/ui';
import { inviteService } from '../../services/inviteService';
import { useAuth } from '../../contexts/AuthContext';

const AcceptInvitePage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [inviteInfo, setInviteInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInvite = async () => {
      if (!token) return;
      try {
        const data = await inviteService.getInvite(token);
        setInviteInfo(data);
      } catch (err: any) {
        setError('This invitation is invalid or has expired.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchInvite();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const form = e.target as HTMLFormElement;
    
    const firstName = (form.elements.namedItem('firstName') as HTMLInputElement).value;
    const lastName = (form.elements.namedItem('lastName') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;

    try {
      setIsSubmitting(true);
      const userData = await inviteService.acceptInvite({
        token,
        firstName,
        lastName,
        password
      });
      login(userData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to join workspace');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-10">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-primary mx-auto"></div>
        <p className="mt-4 text-sm text-brand-on-surface-variant font-bold uppercase tracking-widest">Verifying invitation...</p>
      </div>
    );
  }

  if (error && !inviteInfo) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-red-200">
          <span className="material-symbols-outlined text-3xl">error</span>
        </div>
        <h2 className="text-xl font-black text-brand-on-surface mb-2">Invalid Invite</h2>
        <p className="text-sm text-brand-on-surface-variant mb-8">{error}</p>
        <Button onClick={() => navigate('/')} className="w-full">Return Home</Button>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-brand-xl bg-brand-primary/5 ring-1 ring-brand-primary/10 text-brand-primary mb-6">
          <span className="material-symbols-outlined filled">group_add</span>
        </div>
        <h1 className="text-2xl font-black tracking-tight text-brand-on-surface mb-2">Join Workspace</h1>
        <p className="text-sm text-brand-on-surface-variant leading-relaxed">
          You've been invited to join <span className="font-bold text-brand-on-surface">{inviteInfo?.workspace}</span>.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-brand-xl text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <Input name="firstName" label="First Name" placeholder="Jane" required />
          <Input name="lastName" label="Last Name" placeholder="Smith" required />
        </div>
        <Input 
          label="Email Address" 
          value={inviteInfo?.email} 
          disabled 
          className="bg-brand-surface-container-low"
        />
        <Input name="password" label="Create Password" type="password" placeholder="••••••••" required />

        <div className="bg-brand-surface-container-low p-4 rounded-brand-xl ring-1 ring-brand-outline-variant/5">
          <p className="text-[10px] font-bold text-brand-on-surface-variant leading-relaxed uppercase tracking-widest">
            By joining, you agree to the workspace terms and privacy policies.
          </p>
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full btn-primary-gradient shadow-xl shadow-brand-primary/20 mt-2">
          {isSubmitting ? 'Joining Workspace...' : 'Accept Invitation'}
        </Button>
      </form>
    </div>
  );
};

export default AcceptInvitePage;
