import { Link } from 'react-router-dom';
import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { Button, Input } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';

const SignupPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const form = e.target as HTMLFormElement;
    
    const firstName = (form.elements.namedItem('firstName') as HTMLInputElement).value;
    const lastName = (form.elements.namedItem('lastName') as HTMLInputElement).value;
    const workspaceName = (form.elements.namedItem('workspaceName') as HTMLInputElement).value;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;

    try {
      setIsLoading(true);
      const userData = await authService.signup({
        firstName,
        lastName,
        workspaceName,
        email,
        password
      });
      login(userData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to sign up');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="text-center mb-8">
        <Link to="/" className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-brand-on-surface-variant hover:text-brand-primary transition-colors mb-6">
          <span className="material-symbols-outlined text-[14px]">arrow_back</span>
          Back to Home
        </Link>
        <h1 className="text-2xl font-black tracking-tight text-brand-on-surface mb-2">Join Workspace</h1>
        <p className="text-sm text-brand-on-surface-variant leading-relaxed">Start managing your team with editorial precision.</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSignup} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <Input name="firstName" label="First Name" placeholder="John" required />
          <Input name="lastName" label="Last Name" placeholder="Doe" required />
        </div>
        <Input name="workspaceName" label="Workspace Name" placeholder="e.g. Acme HQ" required />
        <Input name="email" label="Work Email" type="email" placeholder="name@company.com" required />
        <Input name="password" label="Create Password" type="password" placeholder="••••••••" required />

        <div className="bg-brand-surface-container-low p-4 rounded-brand-xl ring-1 ring-brand-outline-variant/5">
          <p className="text-[10px] font-bold text-brand-on-surface-variant leading-relaxed uppercase tracking-widest">
            By joining, you agree to our{' '}
            <Link to="#" className="text-brand-primary hover:underline">Terms</Link> and{' '}
            <Link to="#" className="text-brand-primary hover:underline">Privacy Policy</Link>.
          </p>
        </div>

        <Button type="submit" disabled={isLoading} className="w-full btn-primary-gradient shadow-xl shadow-brand-primary/20 mt-2">
          {isLoading ? 'Creating Account...' : 'Create Free Account'}
        </Button>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-brand-outline-variant/20"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-brand-surface px-2 text-brand-on-surface-variant uppercase tracking-widest font-bold">Or join with</span>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <GoogleLogin
            onSuccess={async (credentialResponse) => {
              if (credentialResponse.credential) {
                try {
                  setIsLoading(true);
                  const userData = await authService.googleAuth(credentialResponse.credential);
                  login(userData);
                } catch (err: any) {
                  setError('Google sign-in failed. Please try again.');
                } finally {
                  setIsLoading(false);
                }
              }
            }}
            onError={() => {
              setError('Google Sign-In failed');
            }}
            useOneTap
            shape="pill"
            theme="filled_blue"
            width="100%"
          />
        </div>
      </div>

      <div className="mt-8 pt-8 border-t border-brand-outline-variant/10 text-center">
        <p className="text-sm text-brand-on-surface-variant">
          Already using TeamTask?{' '}
          <Link to="/login" className="font-bold text-brand-primary hover:text-brand-primary-container transition-colors">
            Sign In Instead
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
