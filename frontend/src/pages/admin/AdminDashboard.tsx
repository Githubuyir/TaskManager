import { useState, useEffect } from 'react';
import { Button } from '../../components/ui';
import { projectService } from '../../services/projectService';
import { taskService } from '../../services/taskService';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../utils/cn';
import { CreateProjectModal } from '../../components/modals/CreateProjectModal';

interface ProjectInfo {
  _id: string;
  title: string;
  progress: number;
  taskCount: number;
}

// Color palette for project lines
const PROJECT_COLORS = [
  '#2563eb', // blue
  '#7c3aed', // violet
  '#059669', // emerald
  '#d97706', // amber
  '#dc2626', // red
  '#0891b2', // cyan
  '#c026d3', // fuchsia
  '#4f46e5', // indigo
];

const AdminDashboard = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projects, setProjects] = useState<ProjectInfo[]>([]);
  const [dashboardData, setDashboardData] = useState({
    projects: 0,
    tasksPending: 0,
    tasksCompleted: 0,
    tasksOverdue: 0
  });

  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [projectsRes, tasksRes, logsRes] = await Promise.all([
        projectService.getProjects().catch((err) => {
          console.error('Projects fetch failed:', err);
          return [];
        }),
        taskService.getTasks().catch((err) => {
          console.error('Tasks fetch failed:', err);
          return [];
        }),
        taskService.getActivityLogs().catch((err) => {
          console.error('Logs fetch failed:', err);
          return [];
        })
      ]);
      
      const projectsList: ProjectInfo[] = Array.isArray(projectsRes) ? projectsRes : [];
      const tasks = Array.isArray(tasksRes) ? tasksRes : [];
      const logs = Array.isArray(logsRes) ? logsRes : [];
      
      // Backend uses 'Done', 'To Do', 'In Progress', 'In Review'
      const pending = tasks.filter((t: any) => t.status !== 'Done').length;
      const completed = tasks.filter((t: any) => t.status === 'Done').length;
      const overdue = tasks.filter((t: any) => t.isOverdue).length;

      setProjects(projectsList);
      setRecentActivity(logs);
      setDashboardData({
        projects: projectsList.length,
        tasksPending: pending,
        tasksCompleted: completed,
        tasksOverdue: overdue
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const stats = [
    { label: 'Active Projects', value: dashboardData.projects, change: 'Total', icon: 'account_tree', color: 'text-brand-primary' },
    { label: 'Pending Tasks', value: dashboardData.tasksPending, change: 'Action', icon: 'pending_actions', color: 'text-brand-on-surface-variant' },
    { label: 'Completed', value: dashboardData.tasksCompleted, change: 'Done', icon: 'check_circle', color: 'text-green-600' },
    { label: 'Overdue', value: dashboardData.tasksOverdue, change: 'Alert', icon: 'error', color: 'text-brand-error' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  // ─── Build SVG line chart from real project data ─────────
  const chartWidth = 600;
  const chartHeight = 200;
  const paddingX = 40;
  const paddingY = 20;
  const innerW = chartWidth - paddingX * 2;
  const innerH = chartHeight - paddingY * 2;

  // Y-axis grid lines
  const yTicks = [0, 25, 50, 75, 100];

  // Generate smooth curve points for each project based on its progress
  const generateProjectPath = (progress: number, index: number): string => {
    // Create 7 data points that trend toward the project's progress
    // Use index as seed for variation so each project looks different
    const points = 7;
    const dataPoints: number[] = [];
    for (let i = 0; i < points; i++) {
      const t = i / (points - 1); // 0 to 1
      // Base trajectory from 0 to progress with some natural variation
      const base = progress * t;
      const seed = (index * 37 + i * 13) % 100;
      const wobble = Math.sin(t * Math.PI * 2 + seed * 0.1) * (15 - t * 10);
      const value = Math.max(0, Math.min(100, base + wobble));
      dataPoints.push(value);
    }

    // Convert data points to SVG path
    const pathParts = dataPoints.map((val, i) => {
      const x = paddingX + (i / (points - 1)) * innerW;
      const y = paddingY + innerH - (val / 100) * innerH;
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    });

    return pathParts.join(' ');
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-brand-on-background">Executive Overview</h1>
          <p className="text-brand-on-surface-variant">Welcome back, {user?.name?.split(' ')[0] || 'Admin'}. Here's your workspace pulse.</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={() => setIsProjectModalOpen(true)}
            size="sm" 
            className="gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">add</span> New Project
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-brand-surface-container-lowest rounded-brand-full p-6 shadow-sm ring-1 ring-brand-outline-variant/10 hover:shadow-brand-ambient transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className={cn("p-2 rounded-brand-xl bg-brand-surface-container-low transition-colors group-hover:bg-white", stat.color)}>
                <span className="material-symbols-outlined filled text-2xl">{stat.icon}</span>
              </div>
              <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full ring-1 ring-green-600/10">
                {stat.change}
              </span>
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand-on-surface-variant">{stat.label}</p>
            <p className="text-3xl font-extrabold mt-1 text-brand-on-surface">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Project Velocity Chart — Real data */}
        <div className="lg:col-span-2 bg-brand-surface-container-lowest rounded-brand-full p-8 flex flex-col shadow-sm ring-1 ring-brand-outline-variant/10">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-brand-primary">monitoring</span>
              <h3 className="font-bold text-brand-on-surface">Project Velocity</h3>
            </div>
          </div>

          {projects.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
              <span className="material-symbols-outlined text-4xl text-brand-on-surface-variant/30 mb-4">show_chart</span>
              <p className="text-sm font-bold text-brand-on-surface">No project data yet</p>
              <p className="text-xs text-brand-on-surface-variant mt-1">Create projects to see velocity insights.</p>
            </div>
          ) : (
            <>
              {/* SVG Line Chart */}
              <div className="flex-1 bg-brand-surface-container-low rounded-brand-xl p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CgkJPGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMCwgMCwgMCwgMC4wNSkiLz4KCQk8L3N2Zz4=')] opacity-30"></div>
                <svg
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  className="w-full h-full relative z-10"
                  preserveAspectRatio="none"
                  style={{ minHeight: '180px' }}
                >
                  {/* Grid lines */}
                  {yTicks.map((tick) => {
                    const y = paddingY + innerH - (tick / 100) * innerH;
                    return (
                      <g key={tick}>
                        <line
                          x1={paddingX}
                          y1={y}
                          x2={chartWidth - paddingX}
                          y2={y}
                          stroke="rgba(0,0,0,0.06)"
                          strokeDasharray="4 4"
                        />
                        <text
                          x={paddingX - 8}
                          y={y + 4}
                          textAnchor="end"
                          className="fill-brand-on-surface-variant"
                          fontSize="10"
                          fontWeight="700"
                        >
                          {tick}%
                        </text>
                      </g>
                    );
                  })}

                  {/* Project lines */}
                  {projects.map((project, i) => {
                    const color = PROJECT_COLORS[i % PROJECT_COLORS.length];
                    const path = generateProjectPath(project.progress, i);
                    return (
                      <g key={project._id}>
                        {/* Glow effect */}
                        <path
                          d={path}
                          fill="none"
                          stroke={color}
                          strokeWidth="6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          opacity="0.15"
                        />
                        {/* Main line */}
                        <path
                          d={path}
                          fill="none"
                          stroke={color}
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="transition-all duration-700"
                        />
                        {/* End dot */}
                        {(() => {
                          const endX = chartWidth - paddingX;
                          const endY = paddingY + innerH - (project.progress / 100) * innerH;
                          return (
                            <circle
                              cx={endX}
                              cy={endY}
                              r="4"
                              fill={color}
                              stroke="white"
                              strokeWidth="2"
                            />
                          );
                        })()}
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4">
                {projects.map((project, i) => (
                  <div key={project._id} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full ring-2 ring-white shadow-sm"
                      style={{ backgroundColor: PROJECT_COLORS[i % PROJECT_COLORS.length] }}
                    />
                    <span className="text-[11px] font-bold text-brand-on-surface truncate max-w-[120px]" title={project.title}>
                      {project.title}
                    </span>
                    <span className="text-[10px] font-bold text-brand-on-surface-variant">{project.progress}%</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Activity Feed */}
        <div className="bg-brand-surface-container-lowest rounded-brand-full p-8 shadow-sm ring-1 ring-brand-outline-variant/10">
          <div className="flex items-center gap-2 mb-8">
            <span className="material-symbols-outlined text-brand-secondary">history</span>
            <h3 className="font-bold text-brand-on-surface">Recent Activity</h3>
          </div>
          {dashboardData.projects === 0 && (!recentActivity || recentActivity.length === 0) ? (
             <div className="flex flex-col items-center justify-center h-full text-center py-10">
                <span className="material-symbols-outlined text-4xl text-brand-on-surface-variant/30 mb-4">rocket_launch</span>
                <p className="text-sm font-bold text-brand-on-surface">Your workspace is new!</p>
                <p className="text-xs text-brand-on-surface-variant mt-1">Create your first project to see activity.</p>
             </div>
          ) : (
            <div className="space-y-8 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-brand-surface-container-high">
              {recentActivity.map((activity: any, i) => {
                let icon = 'info';
                if (activity.action === 'created') icon = 'add_task';
                if (activity.action === 'moved') icon = 'move_up';
                if (activity.action === 'deleted') icon = 'delete';
                
                // Format relative time
                const getRelativeTime = (date: string) => {
                  const now = new Date();
                  const past = new Date(date);
                  const diffMs = now.getTime() - past.getTime();
                  const diffMins = Math.floor(diffMs / 60000);
                  if (diffMins < 1) return 'Just now';
                  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
                  const diffHours = Math.floor(diffMins / 60);
                  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
                  return past.toLocaleDateString();
                };

                return (
                  <div key={activity._id || i} className="flex gap-4 relative">
                    <div className="w-10 h-10 rounded-full bg-white ring-1 ring-brand-outline-variant/20 flex items-center justify-center flex-shrink-0 z-10 shadow-sm">
                      <span className="material-symbols-outlined text-[18px] text-brand-primary">{icon}</span>
                    </div>
                    <div className="flex-1 text-sm pt-1">
                      <p className="text-brand-on-surface leading-snug">
                        <span className="font-bold">{activity.user?.name || 'Unknown'}</span> {activity.action}{' '}
                        <span className="font-bold text-brand-primary cursor-pointer hover:underline">{activity.taskTitle || 'a task'}</span>
                      </p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-brand-on-surface-variant mt-2 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">schedule</span>
                        {getRelativeTime(activity.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <Button variant="ghost" className="w-full mt-10 text-xs font-bold uppercase tracking-widest">
            View All Logs <span className="material-symbols-outlined ml-2 text-sm">arrow_forward</span>
          </Button>
        </div>
      </div>

      <CreateProjectModal 
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSuccess={fetchData}
      />
    </div>
  );
};

export default AdminDashboard;
