import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import { taskService } from '../../services/taskService';
import { cn } from '../../utils/cn';

const MemberDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    upcoming: [] as any[],
    assignedTasks: 0,
    totalTasks: 0,
    doneTasks: 0,
    dueToday: 0,
    completedWeek: 0,
    activityLogs: [] as any[],
    dueDates: [] as string[]
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [tasks, logs] = await Promise.all([
          taskService.getTasks(),
          taskService.getActivityLogs()
        ]);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        const dueToday = tasks.filter((t: any) => {
          if (!t.dueDate || t.status === 'Done') return false;
          const d = new Date(t.dueDate);
          return d >= today && d < tomorrow;
        }).length;

        const completedWeek = tasks.filter((t: any) => {
          if (t.status !== 'Done') return false;
          const updated = new Date(t.updatedAt || t.createdAt);
          return updated >= weekAgo;
        }).length;

        // Get upcoming tasks (not done, sorted by due date)
        const upcoming = tasks
          .filter((t: any) => t.status !== 'Done')
          .sort((a: any, b: any) => new Date(a.dueDate || 0).getTime() - new Date(b.dueDate || 0).getTime())
          .slice(0, 4);

        // Get due dates for active tasks
        const dueDates = tasks
          .filter((t: any) => t.dueDate && t.status !== 'Done')
          .map((t: any) => {
            const d = new Date(t.dueDate);
            // Use UTC components to avoid timezone offset issues
            return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()).toDateString();
          });

        setStats({
          upcoming,
          assignedTasks: tasks.filter((t: any) => t.assignedTo?._id === user?._id).length,
          totalTasks: tasks.length,
          doneTasks: tasks.filter((t: any) => t.status === 'Done').length,
          dueToday,
          completedWeek,
          activityLogs: logs.slice(0, 5), // Get latest 5 logs
          dueDates
        });
      } catch (error) {
        console.error('Member Dashboard fetch error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  // Helper for dates in timeline
  const getTimelineDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = -1; i <= 3; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      dates.push(d);
    }
    return dates;
  };
  const timelineDates = getTimelineDates();

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-brand-on-background">Good Morning, {user?.name?.split(' ')[0]}.</h1>
          <p className="text-brand-on-surface-variant flex items-center gap-2">
            Here is your execution focus for today.
          </p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-brand-surface-container-lowest rounded-brand-2xl p-6 shadow-sm ring-1 ring-brand-outline-variant/10 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-on-surface-variant">Due Today</span>
            {stats.dueToday > 0 && (
              <div className="w-6 h-6 rounded-full bg-brand-error/10 text-brand-error flex items-center justify-center">
                <span className="material-symbols-outlined text-[14px]">priority_high</span>
              </div>
            )}
          </div>
          <div>
            <h2 className="text-4xl font-black text-brand-on-surface mb-2">{stats.dueToday}</h2>
            <p className="text-xs text-brand-on-surface-variant">Tasks require immediate action.</p>
          </div>
        </div>
        
        <div className="bg-brand-surface-container-lowest rounded-brand-2xl p-6 shadow-sm ring-1 ring-brand-outline-variant/10 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-on-surface-variant">Assigned Tasks</span>
            <div className="w-6 h-6 rounded-full bg-brand-secondary/10 text-brand-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-[14px]">assignment_ind</span>
            </div>
          </div>
          <div>
            <h2 className="text-4xl font-black text-brand-on-surface mb-2">{stats.assignedTasks}</h2>
            <p className="text-xs text-brand-on-surface-variant">Active tasks assigned to you.</p>
          </div>
        </div>

        <div className="bg-brand-surface-container-lowest rounded-brand-2xl p-6 shadow-sm ring-1 ring-brand-outline-variant/10 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-on-surface-variant">Completed This Week</span>
            <div className="w-6 h-6 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[14px]">check_circle</span>
            </div>
          </div>
          <div>
            <h2 className="text-4xl font-black text-brand-on-surface mb-2">{stats.completedWeek}</h2>
            <p className="text-xs text-brand-on-surface-variant">Tasks finished.</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Execution Pipeline */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-brand-surface-container-lowest rounded-brand-2xl p-8 shadow-sm ring-1 ring-brand-outline-variant/10">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-bold text-brand-on-surface flex items-center gap-3">
                Execution Pipeline
              </h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/member/tasks')}
                className="text-[10px] font-bold uppercase tracking-widest text-brand-primary hover:text-brand-primary/80"
              >
                View All
              </Button>
            </div>
            <div className="space-y-4">
              {stats.upcoming.length === 0 ? (
                <p className="text-center py-10 text-brand-on-surface-variant italic">No upcoming tasks. Enjoy your day!</p>
              ) : stats.upcoming.map((task) => {
                const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Done';
                return (
                  <div key={task._id} className={cn(
                    "flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-brand-lg bg-white ring-1 transition-all group relative overflow-hidden",
                    isOverdue ? "ring-brand-error/20 hover:ring-brand-error/40 border-l-4 border-l-brand-error" : 
                    task.priority === 'High' ? "ring-amber-500/20 hover:ring-amber-500/40 border-l-4 border-l-amber-500" :
                    "ring-brand-outline-variant/10 hover:ring-brand-outline-variant/30 border-l-4 border-l-brand-primary"
                  )}>
                    <div className="flex items-center gap-4 mb-2 sm:mb-0">
                      <div className="w-5 h-5 rounded border border-brand-outline-variant/30 flex items-center justify-center"></div>
                      <div>
                        <p className="text-sm font-bold text-brand-on-surface">{task.title}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] font-black uppercase tracking-widest bg-brand-surface-container-low px-2 py-0.5 rounded text-brand-on-surface-variant">
                            {task.projectId?.title || 'Personal Task'}
                          </span>
                          {isOverdue && (
                            <span className="text-[10px] font-bold flex items-center gap-1 text-brand-error">
                              <span className="material-symbols-outlined text-[12px]">schedule</span> Overdue
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
                      {!isOverdue && task.dueDate && (
                        <p className="text-xs text-brand-on-surface-variant flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">schedule</span>
                          {new Date(task.dueDate).toLocaleDateString()}
                        </p>
                      )}
                      <div className="w-8 h-8 rounded-full bg-brand-surface-container flex items-center justify-center text-xs font-bold ring-1 ring-white">
                        {user?.name?.charAt(0)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Timeline & Recent Intel */}
        <div className="space-y-8">
          {/* Timeline Box */}
          <div className="bg-brand-surface-container-lowest rounded-brand-2xl p-6 shadow-sm ring-1 ring-brand-outline-variant/10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-sm text-brand-on-surface uppercase tracking-widest">Timeline</h3>
              <span className="text-xs text-brand-on-surface-variant">{new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
            </div>
            <div className="flex justify-between items-center px-2">
              {timelineDates.map((date, idx) => {
                const isToday = date.toDateString() === new Date().toDateString();
                const dayName = date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0);
                return (
                  <div key={idx} className="flex flex-col items-center gap-2">
                    <span className="text-[10px] font-bold text-brand-on-surface-variant">{dayName}</span>
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex flex-col items-center justify-center text-sm font-bold",
                      isToday ? "bg-brand-primary text-white shadow-md shadow-brand-primary/20" : "bg-transparent text-brand-on-surface hover:bg-brand-surface-container-low cursor-pointer"
                    )}>
                      {date.getDate()}
                    </div>
                    {stats.dueDates.includes(date.toDateString()) && (
                      <div className="w-1 h-1 rounded-full bg-brand-error mt-1"></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Intel Box */}
          <div className="bg-brand-surface-container-lowest rounded-brand-2xl p-6 shadow-sm ring-1 ring-brand-outline-variant/10">
            <h3 className="font-bold text-sm text-brand-on-surface uppercase tracking-widest mb-6">Recent Intel</h3>
            <div className="space-y-6">
              {stats.activityLogs.length === 0 ? (
                <p className="text-xs text-brand-on-surface-variant italic">No recent activity.</p>
              ) : stats.activityLogs.map((log: any) => (
                <div key={log._id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-surface-container flex-shrink-0 flex items-center justify-center text-xs font-bold text-brand-on-surface ring-1 ring-brand-outline-variant/10">
                    {log.user?.name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className="text-xs text-brand-on-surface">
                      <span className="font-bold">{log.user?.name}</span> {log.action}{' '}
                      <span className="text-brand-primary font-medium">{log.task?.title}</span>
                    </p>
                    <p className="text-[10px] text-brand-on-surface-variant mt-1">
                      {new Date(log.createdAt).toLocaleString(undefined, { 
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberDashboard;


