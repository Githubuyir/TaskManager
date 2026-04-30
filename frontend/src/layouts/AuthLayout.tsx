import { Outlet, Link } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-background p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 -left-40 w-96 h-96 bg-brand-primary/5 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
        <div className="absolute bottom-0 -right-40 w-96 h-96 bg-brand-tertiary/5 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CgkJPGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMCwgMCwgMCwgMC4wNSkiLz4KCQk8L3N2Zz4=')] opacity-30"></div>
      </div>

      <div className="w-full max-w-md z-10">
        <div className="flex justify-center mb-10">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-brand-primary rounded-brand-md flex items-center justify-center text-white shadow-lg shadow-brand-primary/20 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined filled">layers</span>
            </div>
            <span className="text-2xl font-black tracking-tighter text-brand-on-background">TeamTask</span>
          </Link>
        </div>
        <div className="bg-brand-surface-container-lowest rounded-brand-full p-8 md:p-10 shadow-2xl shadow-brand-on-surface/5 ring-1 ring-brand-outline-variant/10">
          <Outlet />
        </div>
        <p className="mt-8 text-center text-xs font-bold uppercase tracking-widest text-brand-on-surface-variant">
          Precision Task Management © 2024
        </p>
      </div>
    </div>
  );
};

export default AuthLayout;
