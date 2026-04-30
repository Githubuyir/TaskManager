import { Link } from 'react-router-dom';
import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { Button, Input } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';

const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;
    
    try {
      setIsLoading(true);
      const userData = await authService.login({ email, password });
      login(userData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to login');
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
        <h1 className="text-2xl font-black tracking-tight text-brand-on-surface mb-2">Welcome Back</h1>
        <p className="text-sm text-brand-on-surface-variant leading-relaxed">Enter your credentials to access your workspace.</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-6">
        <Input 
          label="Email Address" 
          name="email"
          type="email" 
          placeholder="name@company.com" 
          required 
        />
        <div className="space-y-1">
          <Input 
            label="Password" 
            name="password"
            type="password" 
            placeholder="••••••••" 
            required 
          />
          <div className="flex justify-end">
            <Link to="#" className="text-[10px] font-bold uppercase tracking-widest text-brand-primary hover:text-brand-primary-container transition-colors">
              Forgot password?
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2 cursor-pointer group">
          <input 
            type="checkbox" 
            id="remember"
            className="w-4 h-4 rounded-brand-sm border-brand-outline-variant/30 text-brand-primary focus:ring-brand-primary/20 transition-all cursor-pointer" 
          />
          <label htmlFor="remember" className="text-xs font-bold text-brand-on-surface-variant cursor-pointer group-hover:text-brand-on-surface transition-colors">
            Keep me signed in
          </label>
        </div>

        <Button type="submit" disabled={isLoading} className="w-full btn-primary-gradient shadow-xl shadow-brand-primary/20">
          {isLoading ? 'Signing In...' : 'Sign In to Workspace'}
        </Button>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-brand-outline-variant/20"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-brand-surface px-2 text-brand-on-surface-variant uppercase tracking-widest font-bold">Or continue with</span>
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

      <div className="mt-10 pt-8 border-t border-brand-outline-variant/10 text-center">
        <p className="text-sm text-brand-on-surface-variant">
          New to TeamTask?{' '}
          <Link to="/signup" className="font-bold text-brand-primary hover:text-brand-primary-container transition-colors">
            Create Free Account
          </Link>
        </p>
      </div>
      
      <div className="mt-8 p-4 bg-brand-surface-container-low rounded-brand-xl text-center ring-1 ring-brand-outline-variant/5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-brand-on-surface-variant leading-normal">
          <span className="text-brand-primary mr-1">Demo:</span> 
          Use "admin@example.com" or "user@example.com"
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
