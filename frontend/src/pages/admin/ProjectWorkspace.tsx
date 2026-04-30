import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui';
import { projectService } from '../../services/projectService';
import { taskService } from '../../services/taskService';
import { userService } from '../../services/userService';
import { cn } from '../../utils/cn';
import toast from 'react-hot-toast';

interface Member {
  _id: string;
  name: string;
  email: string;
}

interface Task {
  _id: string;
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  dueDate: string;
  status: 'To Do' | 'In Progress' | 'In Review' | 'Done';
  assignedTo?: { _id: string; name: string; email: string };
  workDescription?: string;
}

interface Project {
  _id: string;
  title: string;
  description?: string;
  members: Member[];
  taskCount: number;
  progress: number;
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
  icon: string;
  color: string;
}

const ProjectWorkspace = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [workspaceMembers, setWorkspaceMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [draggedOver, setDraggedOver] = useState<string | null>(null);
  const [viewTaskWorkDescription, setViewTaskWorkDescription] = useState<string | null>(null);

  // Task form state
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'Medium',
    dueDate: '',
  });
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [taskFormError, setTaskFormError] = useState('');

  const fetchProjectData = useCallback(async () => {
    if (!projectId) return;
    try {
      setIsLoading(true);
      setError(null);

      const [projectsData, tasksData, membersData] = await Promise.all([
        projectService.getProjects(),
        taskService.getTasks(projectId),
        userService.getWorkspaceMembers().catch(() => []),
      ]);

      const projectData = (Array.isArray(projectsData) ? projectsData : [])
        .find((p: any) => p._id === projectId);

      if (!projectData) {
        setError('Project not found');
        return;
      }

      setProject(projectData);
      setTasks(Array.isArray(tasksData) ? tasksData : []);
      setWorkspaceMembers(Array.isArray(membersData) ? membersData : []);
    } catch (err: any) {
      console.error('Error fetching project data:', err);
      setError(err.response?.data?.message || 'Failed to load project');
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProjectData();
  }, [fetchProjectData]);

  // ─── Drag & Drop ──────────────────────────────────────────
  const onDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDraggedOver(columnId);
  };

  const onDragLeave = () => {
    setDraggedOver(null);
  };

  const onDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    setDraggedOver(null);
    const taskId = e.dataTransfer.getData('taskId');
    if (!taskId) return;

    const taskIndex = tasks.findIndex((t) => t._id === taskId);
    if (taskIndex === -1 || tasks[taskIndex].status === newStatus) return;

    // Optimistic update
    const originalTasks = [...tasks];
    const updated = [...tasks];
    updated[taskIndex] = { ...updated[taskIndex], status: newStatus as any };
    setTasks(updated);

    try {
      await taskService.updateTask(taskId, { status: newStatus });
      toast.success(`Task moved to ${newStatus}`);
    } catch (err) {
      console.error('Failed to update task status:', err);
      setTasks(originalTasks);
      toast.error('Failed to update task status');
    }
  };

  // ─── Task Creation ────────────────────────────────────────
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setTaskFormError('');

    if (!taskForm.title.trim()) {
      setTaskFormError('Task title is required');
      return;
    }

    try {
      setIsCreatingTask(true);
      await taskService.createTask({
        ...taskForm,
        projectId,
        status: 'To Do',
      });
      toast.success('Task created successfully');
      setIsTaskModalOpen(false);
      setTaskForm({ title: '', description: '', assignedTo: '', priority: 'Medium', dueDate: '' });
      fetchProjectData();
    } catch (err: any) {
      setTaskFormError(err.response?.data?.message || 'Failed to create task');
    } finally {
      setIsCreatingTask(false);
    }
  };

  // ─── Task Deletion ────────────────────────────────────────
  const handleDeleteTask = async (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation();
    if (!confirm('Delete this task?')) return;
    try {
      await taskService.deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
      toast.success('Task deleted');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete task');
    }
  };

  // ─── Column helpers ───────────────────────────────────────
  const getTasksByStatus = (status: string) => tasks.filter((t) => t.status === status);

  const columns: Column[] = [
    { id: 'To Do', title: 'To Do', icon: 'list_alt', color: 'text-brand-on-surface-variant', tasks: getTasksByStatus('To Do') },
    { id: 'In Progress', title: 'In Progress', icon: 'sync', color: 'text-blue-500', tasks: getTasksByStatus('In Progress') },
    { id: 'In Review', title: 'In Review', icon: 'fact_check', color: 'text-amber-500', tasks: getTasksByStatus('In Review') },
    { id: 'Done', title: 'Done', icon: 'check_circle', color: 'text-green-500', tasks: getTasksByStatus('Done') },
  ];

  // ─── Loading ──────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-brand-surface-container-high rounded-brand-xl animate-pulse" />
          <div className="h-8 w-48 bg-brand-surface-container-high rounded-brand-xl animate-pulse" />
        </div>
        <div className="h-5 w-96 bg-brand-surface-container-high rounded-brand-xl animate-pulse" />
        <div className="flex gap-6 mt-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-80 h-96 bg-brand-surface-container-low/40 rounded-brand-full animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // ─── Error ────────────────────────────────────────────────
  if (error || !project) {
    return (
      <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <div className="w-20 h-20 rounded-full bg-brand-error/10 flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-4xl text-brand-error">error</span>
          </div>
          <h2 className="text-xl font-bold text-brand-on-surface mb-2">
            {error || 'Project not found'}
          </h2>
          <p className="text-sm text-brand-on-surface-variant max-w-md mb-6">
            The project you're looking for doesn't exist or you don't have access.
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => navigate('/admin/projects')} className="gap-2">
              <span className="material-symbols-outlined text-[18px]">arrow_back</span> Back to Projects
            </Button>
            <Button onClick={fetchProjectData} className="gap-2 btn-primary-gradient shadow-lg shadow-brand-primary/20">
              <span className="material-symbols-outlined text-[18px]">refresh</span> Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      {/* Breadcrumb + Header */}
      <div>
        <button
          onClick={() => navigate('/admin/projects')}
          className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-brand-on-surface-variant hover:text-brand-primary transition-colors mb-4 group"
        >
          <span className="material-symbols-outlined text-[16px] group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
          All Projects
        </button>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-brand-xl bg-brand-primary/10 ring-1 ring-brand-primary/15 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-brand-primary text-[20px] filled">account_tree</span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-brand-on-background truncate">
                {project.title}
              </h1>
            </div>
            {project.description && (
              <p className="text-brand-on-surface-variant text-sm ml-[52px]">{project.description}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {/* Members display */}
            <div className="flex items-center gap-2 px-3 py-2 bg-brand-surface-container-low rounded-brand-xl ring-1 ring-brand-outline-variant/10">
              <span className="material-symbols-outlined text-brand-on-surface-variant text-[18px]">group</span>
              <div className="flex -space-x-1.5">
                {(project.members || []).slice(0, 4).map((m) => (
                  <div
                    key={m._id}
                    className="w-6 h-6 rounded-full bg-brand-primary-container flex items-center justify-center text-[9px] font-bold text-brand-on-primary-container ring-2 ring-brand-surface-container-low"
                    title={m.name}
                  >
                    {m.name?.substring(0, 2).toUpperCase()}
                  </div>
                ))}
              </div>
              <span className="text-xs font-bold text-brand-on-surface-variant">
                {project.members?.length || 0}
              </span>
            </div>

            <Button
              onClick={() => setIsTaskModalOpen(true)}
              size="sm"
              className="gap-2 btn-primary-gradient shadow-lg shadow-brand-primary/20"
            >
              <span className="material-symbols-outlined text-[18px]">add_task</span> Add Task
            </Button>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex gap-4 flex-wrap">
        {columns.map((col) => (
          <div key={col.id} className="flex items-center gap-2 px-3 py-1.5 bg-brand-surface-container-low/60 rounded-brand-xl ring-1 ring-brand-outline-variant/5">
            <span className={cn("material-symbols-outlined text-[16px]", col.color)}>{col.icon}</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-on-surface-variant">{col.title}</span>
            <span className="text-xs font-bold text-brand-on-surface">{col.tasks.length}</span>
          </div>
        ))}
      </div>

      {/* Kanban Board — 2×2 Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
        {columns.map((col) => (
          <div
            key={col.id}
            className="flex flex-col min-h-[280px]"
            onDragOver={(e) => onDragOver(e, col.id)}
            onDragLeave={onDragLeave}
            onDrop={(e) => onDrop(e, col.id)}
          >
            {/* Column header */}
            <div className="flex items-center justify-between mb-4 px-1">
              <div className="flex items-center gap-2.5">
                <span className={cn("material-symbols-outlined text-[20px]", col.color)}>{col.icon}</span>
                <h3 className="font-extrabold text-brand-on-surface uppercase tracking-widest text-[10px]">{col.title}</h3>
                <span className="bg-brand-surface-container-high text-brand-on-surface-variant text-[10px] font-bold px-2 py-0.5 rounded-full ring-1 ring-brand-outline-variant/10">
                  {col.tasks.length}
                </span>
              </div>
            </div>

            {/* Column body */}
            <div
              className={cn(
                "flex-1 rounded-brand-full p-4 space-y-3 overflow-y-auto ring-1 min-h-[150px] transition-all duration-200",
                draggedOver === col.id
                  ? "bg-brand-primary/5 ring-brand-primary/30 ring-2"
                  : "bg-brand-surface-container-low/40 ring-brand-outline-variant/5"
              )}
            >
              {col.tasks.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <span className="material-symbols-outlined text-3xl text-brand-on-surface-variant/20 mb-2">inbox</span>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-brand-on-surface-variant/40">
                    {draggedOver === col.id ? 'Drop here' : 'No tasks'}
                  </p>
                </div>
              )}

              {col.tasks.map((task) => (
                <div
                  key={task._id}
                  draggable
                  onDragStart={(e) => onDragStart(e, task._id)}
                  onClick={() => {
                    if (task.status === 'In Review' && task.workDescription) {
                      setViewTaskWorkDescription(task.workDescription);
                    }
                  }}
                  className={cn(
                    "bg-brand-surface-container-lowest rounded-brand-xl p-5 shadow-sm ring-1 ring-brand-outline-variant/10 hover:shadow-brand-ambient transition-all duration-300 group border-l-4 border-transparent hover:border-brand-primary active:scale-[0.97]",
                    task.status === 'In Review' && task.workDescription ? "cursor-pointer" : "cursor-move"
                  )}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex gap-2">
                      <span
                        className={cn(
                        "text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-brand-sm ring-1",
                        task.priority === 'High'
                          ? 'bg-red-50 text-brand-error ring-brand-error/10'
                          : task.priority === 'Medium'
                          ? 'bg-amber-50 text-amber-600 ring-amber-600/10'
                          : 'bg-blue-50 text-brand-primary ring-brand-primary/10'
                      )}
                    >
                      {task.priority}
                      </span>
                    </div>
                    <button
                      onClick={(e) => handleDeleteTask(e, task._id)}
                      className="p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-brand-error/10 text-brand-on-surface-variant hover:text-brand-error transition-all"
                      title="Delete task"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>

                  {task.status === 'In Review' && (
                    <div className="mb-3 flex items-center gap-1.5 w-fit text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-brand-sm ring-1 bg-purple-50 text-purple-600 ring-purple-600/20">
                      <span className="material-symbols-outlined text-[12px]">rate_review</span>
                      Submitted for Review
                    </div>
                  )}

                  <h4 className="font-bold text-sm mb-1.5 text-brand-on-surface group-hover:text-brand-primary transition-colors">
                    {task.title}
                  </h4>
                  {task.description && (
                    <p className="text-xs text-brand-on-surface-variant line-clamp-2 leading-relaxed mb-4">
                      {task.description}
                    </p>
                  )}

                  {task.status === 'In Review' && task.workDescription && (
                    <div className="mb-4 p-3 bg-brand-surface-container-low rounded-brand-lg border border-brand-outline-variant/5 relative">
                      <div className="absolute -top-2 left-3 bg-brand-surface-container-lowest px-1">
                        <span className="text-[8px] font-bold uppercase tracking-widest text-brand-on-surface-variant">Work Description</span>
                      </div>
                      <p className="text-xs text-brand-on-surface italic line-clamp-3 mt-1">"{task.workDescription}"</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-brand-outline-variant/5">
                    <div className="flex items-center gap-1.5 text-brand-on-surface-variant">
                      <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                      <span className="text-[10px] font-bold">
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
                      </span>
                    </div>
                    {task.assignedTo && (
                      <div
                        className="w-6 h-6 rounded-full bg-brand-primary-container flex items-center justify-center text-[9px] font-bold text-brand-on-primary-container ring-1 ring-brand-outline-variant/10"
                        title={task.assignedTo.name}
                      >
                        {task.assignedTo.name?.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Create Task Modal */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-brand-surface rounded-brand-2xl w-full max-w-md p-8 shadow-2xl ring-1 ring-white/10 animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black tracking-tight text-brand-on-surface">New Task</h2>
              <button
                onClick={() => setIsTaskModalOpen(false)}
                className="p-2 hover:bg-brand-surface-container-high rounded-full transition-colors"
              >
                <span className="material-symbols-outlined text-brand-on-surface-variant">close</span>
              </button>
            </div>

            {taskFormError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-brand-xl text-sm font-medium">
                {taskFormError}
              </div>
            )}

            <form onSubmit={handleCreateTask} className="space-y-5">
              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-brand-on-surface-variant ml-1">
                  Task Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Design Login Screen"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="w-full bg-brand-surface-container-low px-4 py-3 rounded-brand-xl text-sm border border-brand-outline-variant/10 focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-brand-on-surface-variant ml-1">
                  Description
                </label>
                <textarea
                  className="w-full bg-brand-surface-container-low px-4 py-3 rounded-brand-xl text-sm border border-brand-outline-variant/10 focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all min-h-[80px] resize-none"
                  placeholder="What needs to be done?"
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                />
              </div>

              {/* Assign to */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-brand-on-surface-variant ml-1">
                  Assign To
                </label>
                <select
                  className="w-full bg-brand-surface-container-low px-4 py-3 rounded-brand-xl text-sm border border-brand-outline-variant/10 focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                  value={taskForm.assignedTo}
                  onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                >
                  <option value="">Unassigned</option>
                  {workspaceMembers.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.name} ({m.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority + Due Date */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-on-surface-variant ml-1">
                    Priority
                  </label>
                  <select
                    className="w-full bg-brand-surface-container-low px-4 py-3 rounded-brand-xl text-sm border border-brand-outline-variant/10 focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-on-surface-variant ml-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    className="w-full bg-brand-surface-container-low px-4 py-3 rounded-brand-xl text-sm border border-brand-outline-variant/10 focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setIsTaskModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isCreatingTask}
                  className="flex-[2] btn-primary-gradient shadow-lg shadow-brand-primary/20"
                >
                  {isCreatingTask ? 'Creating...' : 'Add Task'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Work Description Modal */}
      {viewTaskWorkDescription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-brand-surface rounded-brand-2xl w-full max-w-md p-8 shadow-2xl ring-1 ring-white/10 animate-in zoom-in-95 duration-300">
            <h2 className="text-2xl font-black tracking-tight text-brand-on-surface mb-2">Work Description</h2>
            <p className="text-sm text-brand-on-surface-variant mb-6">Review the work submitted by the member.</p>
            
            <div className="space-y-4">
              <div className="w-full bg-brand-surface-container-low px-4 py-3 rounded-brand-xl text-sm border border-brand-outline-variant/10 min-h-[120px] max-h-[300px] overflow-y-auto whitespace-pre-wrap">
                {viewTaskWorkDescription}
              </div>
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setViewTaskWorkDescription(null)}
                  className="px-4 py-2 text-sm font-bold text-white bg-brand-primary hover:bg-brand-primary/90 rounded-brand-xl shadow-lg shadow-brand-primary/20 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectWorkspace;
