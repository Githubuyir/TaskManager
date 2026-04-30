import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const AdminPreview = () => (
  <div className="bg-brand-surface-container-lowest rounded-brand-xl flex flex-col overflow-hidden shadow-lg ring-1 ring-brand-outline-variant/20 h-[480px]">
    {/* Top bar */}
    <div className="h-12 border-b border-brand-surface-container-low flex items-center px-5 justify-between bg-white">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-brand-primary text-lg filled">layers</span>
        <span className="text-sm font-black text-brand-on-surface tracking-tight">TeamTask</span>
      </div>
      <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center text-white text-xs font-bold">SA</div>
    </div>
    <div className="flex flex-1 overflow-hidden">
      {/* Sidebar */}
      <div className="w-44 border-r border-brand-surface-container-low bg-brand-surface-container-lowest flex flex-col p-3 gap-1 shrink-0">
        <div className="flex items-center gap-2 px-3 py-2 rounded-brand-xl bg-brand-primary text-white text-xs font-bold">
          <span className="material-symbols-outlined text-[16px] filled">dashboard</span> Dashboard
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-brand-xl text-brand-on-surface-variant text-xs font-semibold">
          <span className="material-symbols-outlined text-[16px]">account_tree</span> Projects
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-brand-xl text-brand-on-surface-variant text-xs font-semibold">
          <span className="material-symbols-outlined text-[16px]">groups</span> Team
        </div>
      </div>
      {/* Main */}
      <div className="flex-1 p-5 bg-brand-surface overflow-hidden">
        <p className="text-[10px] font-black uppercase tracking-widest text-brand-on-surface-variant mb-4">Executive Overview</p>
        {/* Stat cards */}
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[
            { label: 'Projects', val: '12', icon: 'account_tree', color: 'text-brand-primary' },
            { label: 'Tasks', val: '48', icon: 'pending_actions', color: 'text-brand-on-surface-variant' },
            { label: 'Done', val: '124', icon: 'check_circle', color: 'text-green-600' },
            { label: 'Overdue', val: '3', icon: 'error', color: 'text-brand-error' },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-brand-xl p-3 ring-1 ring-brand-outline-variant/10 shadow-sm">
              <span className={`material-symbols-outlined filled text-lg ${s.color}`}>{s.icon}</span>
              <p className="text-[9px] text-brand-on-surface-variant font-bold uppercase mt-1">{s.label}</p>
              <p className="text-xl font-black text-brand-on-surface">{s.val}</p>
            </div>
          ))}
        </div>
        {/* Chart bar */}
        <div className="bg-white rounded-brand-xl p-4 ring-1 ring-brand-outline-variant/10 shadow-sm mb-4">
          <p className="text-[9px] font-black uppercase tracking-widest text-brand-on-surface-variant mb-3">Project Velocity</p>
          <div className="flex items-end gap-2 h-16">
            {[40, 65, 45, 90, 60, 80, 50].map((h, i) => (
              <div key={i} className="flex-1 bg-brand-primary/10 rounded-t relative">
                <div className="absolute bottom-0 w-full rounded-t" style={{ height: `${h}%`, background: 'linear-gradient(135deg,#004ac6,#2563eb)' }} />
              </div>
            ))}
          </div>
        </div>
        {/* Activity */}
        <div className="bg-white rounded-brand-xl p-4 ring-1 ring-brand-outline-variant/10 shadow-sm">
          <p className="text-[9px] font-black uppercase tracking-widest text-brand-on-surface-variant mb-3">Recent Activity</p>
          {['Sarah Chen completed Mobile Mockups', 'Alex moved API Integration', 'Mike added Feedback Loop'].map((a, i) => (
            <div key={i} className="flex items-center gap-2 py-1.5 border-b border-brand-surface-container-low last:border-0">
              <div className="w-5 h-5 rounded-full bg-brand-primary/10 shrink-0" />
              <p className="text-[9px] text-brand-on-surface truncate">{a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const MemberPreview = () => (
  <div className="bg-brand-surface-container-lowest rounded-brand-xl flex flex-col overflow-hidden shadow-lg ring-1 ring-brand-outline-variant/20 h-[480px]">
    {/* Top bar */}
    <div className="h-12 border-b border-brand-surface-container-low flex items-center px-5 justify-between bg-white">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-brand-primary text-lg filled">layers</span>
        <span className="text-sm font-black text-brand-on-surface tracking-tight">TeamTask</span>
      </div>
      <div className="w-8 h-8 rounded-full bg-brand-secondary flex items-center justify-center text-white text-xs font-bold">SC</div>
    </div>
    <div className="flex flex-1 overflow-hidden">
      {/* Sidebar */}
      <div className="w-44 border-r border-brand-surface-container-low bg-brand-surface-container-lowest flex flex-col p-3 gap-1 shrink-0">
        <div className="flex items-center gap-2 px-3 py-2 rounded-brand-xl bg-brand-primary text-white text-xs font-bold">
          <span className="material-symbols-outlined text-[16px] filled">dashboard</span> Dashboard
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-brand-xl text-brand-on-surface-variant text-xs font-semibold">
          <span className="material-symbols-outlined text-[16px]">assignment</span> My Tasks
        </div>
      </div>
      {/* Main */}
      <div className="flex-1 p-5 bg-brand-surface overflow-hidden">
        <p className="text-[10px] font-black uppercase tracking-widest text-brand-on-surface-variant mb-4">Good Morning, Sarah</p>
        {/* Upcoming tasks */}
        <div className="bg-white rounded-brand-xl p-4 ring-1 ring-brand-outline-variant/10 shadow-sm mb-4">
          <p className="text-[9px] font-black uppercase tracking-widest text-brand-on-surface-variant mb-3 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px] text-brand-primary">calendar_month</span> Upcoming
          </p>
          {[
            { title: 'Finalize Mobile Mockups', due: 'Today 5 PM', priority: 'High' },
            { title: 'Weekly Team Sync', due: 'Tomorrow 10 AM', priority: 'Medium' },
            { title: 'Update Design Tokens', due: 'May 12', priority: 'Low' },
          ].map((t, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-brand-surface-container-low last:border-0">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full border-2 border-brand-outline-variant/30 shrink-0" />
                <p className="text-[9px] font-bold text-brand-on-surface">{t.title}</p>
              </div>
              <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full ${t.priority === 'High' ? 'bg-red-50 text-brand-error' : 'bg-brand-primary/5 text-brand-primary'}`}>{t.priority}</span>
            </div>
          ))}
        </div>
        {/* Projects */}
        <div className="bg-white rounded-brand-xl p-4 ring-1 ring-brand-outline-variant/10 shadow-sm">
          <p className="text-[9px] font-black uppercase tracking-widest text-brand-on-surface-variant mb-3">Project Health</p>
          {[
            { name: 'SaaS Redesign', pct: 65 },
            { name: 'Design System', pct: 90 },
            { name: 'Marketing', pct: 20 },
          ].map((p, i) => (
            <div key={i} className="mb-2">
              <div className="flex justify-between mb-1">
                <p className="text-[9px] font-bold text-brand-on-surface">{p.name}</p>
                <p className="text-[9px] font-black text-brand-on-surface">{p.pct}%</p>
              </div>
              <div className="h-1.5 bg-brand-surface-container-low rounded-full overflow-hidden">
                <div className="h-full bg-brand-primary rounded-full" style={{ width: `${p.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const LandingPage = () => {
  const navigate = useNavigate();
  const [activeRole, setActiveRole] = useState<'admin' | 'member'>('admin');

  // Swipe detection
  const touchStartX = useRef<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (delta > 80) navigate('/login');   // swipe left → login
    if (delta < -80) navigate('/');       // swipe right → home
    touchStartX.current = null;
  };

  return (
    <div
      className="bg-brand-surface text-brand-on-surface antialiased selection:bg-brand-primary-container selection:text-brand-on-primary-container"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* TopNavBar */}
      <nav aria-label="Main Navigation" className="fixed top-0 w-full z-50 bg-white border-b border-brand-outline-variant/15 shadow-sm shadow-brand-on-surface/5">
        <div className="flex justify-between items-center h-16 px-6 lg:px-12 max-w-[1440px] mx-auto">
          <div className="flex items-center gap-8">
            <Link className="text-xl font-bold tracking-tighter text-brand-on-surface flex items-center gap-2" to="/">
              <span className="material-symbols-outlined text-brand-primary filled">layers</span>
              Team Task Manager
            </Link>
            <div className="hidden md:flex items-center gap-6 font-medium tracking-tight text-sm">
              <Link className="text-brand-primary font-semibold hover:text-brand-primary/80 transition-colors" to="#">Platform</Link>
              <Link className="text-brand-on-surface-variant hover:text-brand-primary transition-colors" to="#">Solutions</Link>
              <Link className="text-brand-on-surface-variant hover:text-brand-primary transition-colors" to="#">Enterprise</Link>
              <Link className="text-brand-on-surface-variant hover:text-brand-primary transition-colors" to="#">Pricing</Link>
            </div>
          </div>
          <div className="flex items-center gap-4 font-medium tracking-tight text-sm">
            <Link className="text-brand-on-surface-variant hover:text-brand-primary transition-colors hidden sm:block" to="/login">Log In</Link>
            <Link className="btn-primary-gradient text-white px-4 py-2 rounded-brand-xl hover:opacity-90 transition-opacity active:scale-95 duration-150 shadow-sm shadow-brand-primary/20" to="/signup">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Main Content Canvas */}
      <main className="pt-16 pb-20">
        {/* Hero Section */}
        <section className="relative pt-20 pb-16 px-6 lg:px-12 max-w-[1440px] mx-auto overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-brand-surface">
            <div className="absolute top-0 -left-40 w-96 h-96 bg-brand-primary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
            <div className="absolute top-0 -right-40 w-96 h-96 bg-brand-secondary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
            <div className="absolute -bottom-40 left-20 w-96 h-96 bg-brand-tertiary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CgkJPGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMCwgMCwgMCwgMC4wNSkiLz4KCQk8L3N2Zz4=')] opacity-50"></div>
          </div>
          <div className="max-w-4xl mx-auto text-center z-10 relative">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-brand-on-surface leading-tight mb-6" style={{ letterSpacing: '-0.02em' }}>
              <span className="block">
                Manage <span className="gradient-word">Projects</span>, Assign <span className="gradient-word">Tasks</span>, Track <span className="gradient-word">Progress</span> —
              </span>
              <span className="block">
                All in One <span className="gradient-word">Workspace</span>
              </span>
            </h1>
            <p className="text-lg md:text-xl text-brand-on-surface-variant max-w-2xl mx-auto mb-10 leading-relaxed">
              Admins create and manage workspaces. Team members join through secure invitations.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link className="btn-primary-gradient text-white px-8 py-4 rounded-brand-full font-medium hover:opacity-90 transition-opacity w-full sm:w-auto text-center shadow-lg shadow-brand-primary/20 ring-1 ring-white/10 flex items-center justify-center gap-2" to="/signup">
                Get Started
                <span aria-hidden="true" className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
              <Link className="bg-brand-surface-container-highest text-brand-on-surface px-8 py-4 rounded-brand-full font-medium hover:bg-brand-surface-container-high transition-colors w-full sm:w-auto text-center flex items-center justify-center gap-2" to="/login">
                Sign In
              </Link>
            </div>
          </div>
        </section>

        {/* Engineered for Complexity Bento Grid */}
        <section className="py-24 px-6 lg:px-12 bg-brand-surface-container-low">
          <div className="max-w-[1440px] mx-auto">
            <div className="mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-brand-on-surface mb-4">Engineered for Complexity</h2>
              <p className="text-brand-on-surface-variant text-lg max-w-2xl">
                Powerful tools designed to handle intricate projects without overwhelming your team. Everything you need to scale.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Bento Box 1: Task Dependencies */}
              <div className="col-span-1 md:col-span-2 bg-brand-surface-container-lowest rounded-[24px] p-8 ring-1 ring-brand-outline-variant/20 shadow-sm shadow-brand-on-surface/5 flex flex-col justify-between overflow-hidden relative group hover:shadow-lg transition-shadow duration-300">
                <div className="relative z-10 w-full md:w-2/3 mb-8">
                  <div className="w-12 h-12 bg-brand-primary/10 rounded-full flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-brand-primary filled">account_tree</span>
                  </div>
                  <h3 className="text-2xl font-bold text-brand-on-surface mb-3">Task Dependencies</h3>
                  <p className="text-brand-on-surface-variant leading-relaxed">
                    Map out complex relationships between tasks. Blockers and prerequisites are visually tracked so you always know what needs to happen next.
                  </p>
                </div>
                {/* Visual Mockup */}
                <div className="absolute right-[-10%] bottom-[-20%] w-[60%] h-[80%] bg-brand-surface-container-low rounded-tl-[24px] ring-1 ring-brand-outline-variant/20 shadow-xl p-4 flex flex-col gap-3 group-hover:-translate-y-2 group-hover:-translate-x-2 transition-transform duration-500">
                   <div className="h-10 bg-white rounded-lg ring-1 ring-brand-outline-variant/10 flex items-center px-4 gap-3 relative">
                     <div className="w-4 h-4 rounded-full bg-brand-primary"></div>
                     <div className="h-2 w-24 bg-brand-surface-variant rounded"></div>
                     <div className="absolute top-full left-6 w-0.5 h-6 bg-brand-primary/30"></div>
                   </div>
                   <div className="h-10 bg-white rounded-lg ring-1 ring-brand-outline-variant/10 flex items-center px-4 gap-3 ml-8 relative">
                     <div className="absolute top-1/2 -left-8 w-8 h-0.5 bg-brand-primary/30"></div>
                     <div className="w-4 h-4 rounded-full border-2 border-brand-primary text-brand-primary flex items-center justify-center text-[10px] font-bold">!</div>
                     <div className="h-2 w-32 bg-brand-surface-variant rounded"></div>
                   </div>
                   <div className="h-10 bg-white rounded-lg ring-1 ring-brand-outline-variant/10 flex items-center px-4 gap-3 ml-8 relative opacity-50">
                     <div className="absolute top-1/2 -left-8 w-8 h-0.5 bg-brand-outline-variant/30"></div>
                     <div className="w-4 h-4 rounded-full border-2 border-brand-outline-variant text-brand-outline-variant flex items-center justify-center text-[10px] font-bold"></div>
                     <div className="h-2 w-20 bg-brand-surface-variant rounded"></div>
                   </div>
                </div>
              </div>

              {/* Bento Box 2: Automated Workflows */}
              <div className="col-span-1 bg-brand-surface-container-lowest rounded-[24px] p-8 ring-1 ring-brand-outline-variant/20 shadow-sm shadow-brand-on-surface/5 flex flex-col">
                <div className="w-12 h-12 bg-brand-tertiary/10 rounded-full flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-brand-tertiary filled">electric_bolt</span>
                </div>
                <h3 className="text-xl font-bold text-brand-on-surface mb-3">Automated Workflows</h3>
                <p className="text-brand-on-surface-variant leading-relaxed text-sm mb-8">
                  Set triggers and actions to automate repetitive tasks and status updates.
                </p>
                <div className="flex-1 bg-brand-surface rounded-xl ring-1 ring-brand-outline-variant/10 p-4 flex flex-col justify-center gap-2">
                  <div className="bg-white rounded p-2 text-[10px] font-bold flex items-center gap-2 shadow-sm">
                    <span className="material-symbols-outlined text-[14px] text-green-600">check_circle</span>
                    When task is done
                  </div>
                  <div className="w-0.5 h-4 bg-brand-outline-variant/30 mx-auto"></div>
                  <div className="bg-white rounded p-2 text-[10px] font-bold flex items-center gap-2 shadow-sm">
                    <span className="material-symbols-outlined text-[14px] text-brand-tertiary">notifications</span>
                    Notify stakeholders
                  </div>
                </div>
              </div>

              {/* Bento Box 3: Advanced Permissions */}
              <div className="col-span-1 bg-brand-surface-container-lowest rounded-[24px] p-8 ring-1 ring-brand-outline-variant/20 shadow-sm shadow-brand-on-surface/5 flex flex-col">
                <div className="w-12 h-12 bg-brand-secondary/10 rounded-full flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-brand-secondary filled">shield_person</span>
                </div>
                <h3 className="text-xl font-bold text-brand-on-surface mb-3">Granular Access</h3>
                <p className="text-brand-on-surface-variant leading-relaxed text-sm mb-8">
                  Control exactly who sees what with precise role-based permissions down to the field level.
                </p>
                <div className="flex-1 flex items-center justify-center">
                  <div className="flex -space-x-3">
                    <div className="w-10 h-10 rounded-full bg-brand-primary border-2 border-white flex items-center justify-center text-white text-xs font-bold shadow-sm">AD</div>
                    <div className="w-10 h-10 rounded-full bg-brand-secondary border-2 border-white flex items-center justify-center text-white text-xs font-bold shadow-sm">ED</div>
                    <div className="w-10 h-10 rounded-full bg-brand-tertiary border-2 border-white flex items-center justify-center text-white text-xs font-bold shadow-sm">VI</div>
                  </div>
                </div>
              </div>

              {/* Bento Box 4: Velocity Analytics */}
              <div className="col-span-1 md:col-span-2 bg-brand-surface-container-lowest rounded-[24px] p-8 ring-1 ring-brand-outline-variant/20 shadow-sm shadow-brand-on-surface/5 flex flex-col justify-between overflow-hidden relative group hover:shadow-lg transition-shadow duration-300">
                <div className="relative z-10 w-full md:w-1/2 mb-8">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-blue-600 filled">monitoring</span>
                  </div>
                  <h3 className="text-2xl font-bold text-brand-on-surface mb-3">Velocity Analytics</h3>
                  <p className="text-brand-on-surface-variant leading-relaxed">
                    Track your team's throughput over time. Identify bottlenecks early and optimize your development lifecycle with real-time charts.
                  </p>
                </div>
                {/* Visual Mockup */}
                <div className="absolute right-[-5%] bottom-[-10%] w-[50%] h-[70%] bg-white rounded-tl-[24px] ring-1 ring-brand-outline-variant/20 shadow-xl p-6 flex flex-col justify-end group-hover:-translate-y-2 group-hover:-translate-x-2 transition-transform duration-500">
                  <div className="flex items-end gap-3 h-full">
                    {[30, 45, 60, 50, 80, 95, 70].map((h, i) => (
                      <div key={i} className="flex-1 bg-brand-primary/10 rounded-t relative group/bar">
                        <div className="absolute bottom-0 w-full rounded-t transition-all duration-500 ease-out" style={{ height: `${h}%`, background: 'linear-gradient(135deg,#004ac6,#2563eb)' }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Built for Teams Flow */}
        <section className="py-24 px-6 lg:px-12 bg-brand-surface">
          <div className="max-w-[1440px] mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-brand-on-surface mb-4">Built for Teams</h2>
              <p className="text-brand-on-surface-variant text-lg max-w-2xl mx-auto">A seamless flow from creation to collaboration. Admins create workspaces, invite members, and collaborate in shared projects.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-brand-surface-container-lowest rounded-brand-full p-8 shadow-lg shadow-brand-on-surface/5 ring-1 ring-brand-outline-variant/20 relative mt-6 md:mt-0">
                <div className="absolute -top-6 left-8 w-12 h-12 bg-brand-primary text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg shadow-brand-primary/20">1</div>
                <div className="mt-4">
                  <span className="material-symbols-outlined text-brand-primary text-3xl mb-4 filled">domain_add</span>
                  <h3 className="text-xl font-bold text-brand-on-surface mb-2">Create Workspace</h3>
                  <p className="text-brand-on-surface-variant text-sm">Admins set up the organizational structure, define roles, and establish the foundational projects.</p>
                </div>
              </div>
              <div className="bg-brand-surface-container-lowest rounded-brand-full p-8 shadow-lg shadow-brand-on-surface/5 ring-1 ring-brand-outline-variant/20 relative mt-6 md:mt-0">
                <div className="absolute -top-6 left-8 w-12 h-12 bg-brand-secondary text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg shadow-brand-secondary/20">2</div>
                <div className="mt-4">
                  <span className="material-symbols-outlined text-brand-secondary text-3xl mb-4 filled">person_add</span>
                  <h3 className="text-xl font-bold text-brand-on-surface mb-2">Invite Members</h3>
                  <p className="text-brand-on-surface-variant text-sm">Send secure, role-based invitations to team members, granting them precise access to the resources they need.</p>
                </div>
              </div>
              <div className="bg-brand-surface-container-lowest rounded-brand-full p-8 shadow-lg shadow-brand-on-surface/5 ring-1 ring-brand-outline-variant/20 relative mt-6 md:mt-0">
                <div className="absolute -top-6 left-8 w-12 h-12 bg-brand-tertiary text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg shadow-brand-tertiary/20">3</div>
                <div className="mt-4">
                  <span className="material-symbols-outlined text-brand-tertiary text-3xl mb-4 filled">handshake</span>
                  <h3 className="text-xl font-bold text-brand-on-surface mb-2">Collaborate</h3>
                  <p className="text-brand-on-surface-variant text-sm">Work together in shared projects with real-time updates, integrated discussions, and transparent progress tracking.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Built for Every Role */}
        <section className="py-24 px-6 lg:px-12 bg-brand-surface-container-low">
          <div className="max-w-[1440px] mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-brand-on-surface mb-4">Built for Every Role</h2>
            <p className="text-brand-on-surface-variant text-lg mb-10 max-w-2xl mx-auto">Different responsibilities require different views. Toggle between the high-level Admin orchestration and the focused Member execution workspace.</p>

            {/* Tab Toggle */}
            <div className="inline-flex bg-brand-surface-container-high rounded-full p-1 mb-10 ring-1 ring-brand-outline-variant/20 shadow-inner">
              <button
                onClick={() => setActiveRole('admin')}
                className={`px-6 py-2 rounded-full font-semibold text-sm transition-all duration-200 ${activeRole === 'admin' ? 'bg-white text-brand-on-surface shadow-sm ring-1 ring-brand-outline-variant/10' : 'text-brand-on-surface-variant hover:text-brand-on-surface'}`}
              >
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
                  Admin Workspace
                </span>
              </button>
              <button
                onClick={() => setActiveRole('member')}
                className={`px-6 py-2 rounded-full font-semibold text-sm transition-all duration-200 ${activeRole === 'member' ? 'bg-white text-brand-on-surface shadow-sm ring-1 ring-brand-outline-variant/10' : 'text-brand-on-surface-variant hover:text-brand-on-surface'}`}
              >
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">person</span>
                  Member Workspace
                </span>
              </button>
            </div>

            {/* Live Preview */}
            <div className="bg-brand-surface-container-lowest rounded-brand-full p-4 md:p-6 shadow-inner ring-1 ring-brand-outline-variant/10 text-left">
              {activeRole === 'admin' ? <AdminPreview /> : <MemberPreview />}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-32 px-6 lg:px-12 bg-brand-on-surface text-brand-surface relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
          <div className="max-w-3xl mx-auto text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-white">Ready to streamline your workflow?</h2>
            <p className="text-brand-surface-variant text-lg mb-10">Join thousands of engineering teams who have upgraded to a precision workspace.</p>
            <Link className="btn-primary-gradient text-white px-10 py-5 rounded-brand-full font-semibold text-lg hover:opacity-90 transition-opacity inline-flex items-center gap-3 shadow-lg shadow-brand-primary/20" to="/signup">
              Start Your Free Trial
              <span aria-hidden="true" className="material-symbols-outlined">rocket_launch</span>
            </Link>
            <p className="mt-6 text-brand-surface-dim text-sm">No credit card required. 14-day full-featured trial.</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white w-full py-12 border-t border-brand-outline-variant/15">
        <div className="flex flex-col md:flex-row justify-between items-center px-8 max-w-7xl mx-auto gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <span className="text-lg font-black text-brand-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-brand-primary text-xl filled">layers</span>
              Team Task Manager
            </span>
            <p className="text-xs uppercase tracking-widest text-brand-on-surface-variant">© 2024 Team Task Manager. Precision in every pixel.</p>
          </div>
          <nav className="flex gap-6 text-xs uppercase tracking-widest text-brand-on-surface-variant">
            <Link className="hover:text-brand-on-surface transition-colors" to="#">Privacy Policy</Link>
            <Link className="hover:text-brand-on-surface transition-colors" to="#">Terms of Service</Link>
            <Link className="hover:text-brand-on-surface transition-colors" to="#">Security</Link>
            <Link className="hover:text-brand-on-surface transition-colors" to="#">Status</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
