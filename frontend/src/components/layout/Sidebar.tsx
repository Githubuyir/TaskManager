import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  role: 'admin' | 'member';
}

const Sidebar = ({ role }: SidebarProps) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const adminLinks = [
    { to: '/admin/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { to: '/admin/projects', icon: 'account_tree', label: 'Projects' },
    { to: '/admin/team', icon: 'groups', label: 'Team' },
  ];

  const memberLinks = [
    { to: '/member/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { to: '/member/projects', icon: 'account_tree', label: 'My Projects' },
    { to: '/member/tasks', icon: 'assignment', label: 'My Tasks' },
  ];

  const links = role === 'admin' ? adminLinks : memberLinks;

  return (
    <aside className="w-64 h-screen bg-brand-surface-container-lowest border-r border-brand-outline-variant/15 flex flex-col fixed left-0 top-0 z-50">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 bg-brand-primary rounded-brand-md flex items-center justify-center text-white font-bold text-lg">
            <span className="material-symbols-outlined filled text-lg">layers</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-brand-on-surface">TeamTask</span>
        </div>

        <nav className="space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => cn(
                "flex items-center justify-between px-3 py-2.5 rounded-brand-xl transition-all duration-200 group",
                isActive 
                  ? "btn-primary-gradient text-white shadow-lg shadow-brand-primary/20" 
                  : "text-brand-on-surface-variant hover:bg-brand-surface-container-high hover:text-brand-on-surface"
              )}
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      "material-symbols-outlined text-[20px]",
                      isActive ? "filled" : ""
                    )}>
                      {link.icon}
                    </span>
                    <span className="font-semibold text-sm">{link.label}</span>
                  </div>
                  <span className="material-symbols-outlined text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    chevron_right
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6 space-y-1">
        <NavLink
          to={role === 'admin' ? '/admin/settings' : '/member/settings'}
          className={({ isActive }) => cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-brand-xl transition-all",
            isActive 
              ? "bg-brand-surface-container-high text-brand-on-surface font-bold shadow-sm" 
              : "text-brand-on-surface-variant hover:bg-brand-surface-container-high hover:text-brand-on-surface font-semibold"
          )}
        >
          <span className={cn("material-symbols-outlined text-[20px]", location.pathname.includes('/settings') && "filled")}>settings</span>
          <span className="text-sm">Settings</span>
        </NavLink>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-brand-xl text-brand-error hover:bg-brand-error/10 transition-all text-left"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          <span className="font-semibold text-sm">Logout</span>
        </button>
        
        {user && (
          <div className="mt-8 p-4 bg-brand-surface-container-low rounded-brand-xl border border-brand-outline-variant/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-primary-container flex items-center justify-center text-brand-on-primary-container font-bold uppercase">
                {user.name?.substring(0, 2) || 'U'}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-bold truncate text-brand-on-surface">{user.name}</span>
                <span className="text-xs text-brand-on-surface-variant truncate capitalize">{user.role}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
