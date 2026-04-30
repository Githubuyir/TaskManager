import { useState, useEffect } from 'react';
import { cn } from '../../utils/cn';
import { taskService } from '../../services/taskService';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface Task {
  _id: string;
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  comments?: number;
  files?: number;
  dueDate: string;
  status: 'To Do' | 'In Progress' | 'In Review' | 'Done';
  isOverdue?: boolean;
  projectId?: {
    _id: string;
    title: string;
  };
  assignedTo?: {
    _id: string;
    name: string;
  };
  workDescription?: string;
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
  icon: string;
}

interface KanbanBoardProps {
  viewMode?: 'kanban' | 'list';
  projectId?: string;
}

const KanbanBoard = ({ viewMode = 'kanban', projectId }: KanbanBoardProps = {}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const data = await taskService.getTasks(projectId);
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  const onDragStart = (e: React.DragEvent, task: Task) => {
    if (user?.role === 'member') {
      if (task.assignedTo?._id !== user._id) {
        e.preventDefault();
        toast.error("You can only move tasks assigned to you");
        return;
      }
      if (task.status === 'Done') {
        e.preventDefault();
        toast.error("You cannot move tasks out of Done");
        return;
      }
    }
    e.dataTransfer.setData('taskId', task._id);
  };

  const onDragOver = (e: React.DragEvent, colId: string) => {
    if (user?.role === 'member' && colId === 'Done') {
      return; // Do not allow drag over 'Done' for members
    }
    e.preventDefault();
  };

  const [pendingReviewTaskId, setPendingReviewTaskId] = useState<string | null>(null);
  const [workDescription, setWorkDescription] = useState('');
  const [viewTaskWorkDescription, setViewTaskWorkDescription] = useState<string | null>(null);

  const onDrop = async (e: React.DragEvent, newStatus: string) => {
    if (user?.role === 'member' && newStatus === 'Done') {
      toast.error("Only admins can mark tasks as Done");
      return;
    }

    const taskId = e.dataTransfer.getData('taskId');
    if (!taskId) return;

    if (user?.role === 'member' && newStatus === 'In Review') {
      const task = tasks.find(t => t._id === taskId);
      if (task?.status === 'In Progress') {
        setPendingReviewTaskId(taskId);
        setWorkDescription(task.workDescription || '');
        return; // wait for modal submission
      }
    }

    // Optimistic Update
    const originalTasks = [...tasks];
    const taskIndex = tasks.findIndex(t => t._id === taskId);
    if (taskIndex === -1) return;

    const updatedTasks = [...tasks];
    updatedTasks[taskIndex] = { ...updatedTasks[taskIndex], status: newStatus as any };
    setTasks(updatedTasks);

    try {
      await taskService.updateTask(taskId, { status: newStatus });
      toast.success('Task status updated');
    } catch (error: any) {
      console.error('Failed to update task status:', error);
      toast.error(error.response?.data?.message || 'Failed to update task status');
      setTasks(originalTasks); // Rollback
    }
  };

  const submitForReview = async () => {
    if (!workDescription.trim()) {
      toast.error("Work description is required");
      return;
    }
    const taskId = pendingReviewTaskId;
    if (!taskId) return;
    setPendingReviewTaskId(null);

    const originalTasks = [...tasks];
    const taskIndex = tasks.findIndex(t => t._id === taskId);
    if (taskIndex === -1) return;

    const updatedTasks = [...tasks];
    updatedTasks[taskIndex] = { ...updatedTasks[taskIndex], status: 'In Review', workDescription };
    setTasks(updatedTasks);

    try {
      await taskService.updateTask(taskId, { status: 'In Review', workDescription });
      toast.success('Task submitted for review');
    } catch (error: any) {
      console.error('Failed to submit for review:', error);
      toast.error(error.response?.data?.message || 'Failed to submit task');
      setTasks(originalTasks); // Rollback
    }
  };

  const getTasksByStatus = (status: string) => {
    return tasks.filter(t => t.status === status);
  };

  const columns: Column[] = [
    {
      id: 'To Do',
      title: 'To Do',
      icon: 'list_alt',
      tasks: getTasksByStatus('To Do')
    },
    {
      id: 'In Progress',
      title: 'In Progress',
      icon: 'sync',
      tasks: getTasksByStatus('In Progress')
    },
    {
      id: 'In Review',
      title: 'In Review',
      icon: 'fact_check',
      tasks: getTasksByStatus('In Review')
    },
    {
      id: 'Done',
      title: 'Done',
      icon: 'check_circle',
      tasks: getTasksByStatus('Done')
    }
  ];

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 text-brand-on-surface-variant font-bold">Loading tasks...</div>;
  }

  if (viewMode === 'list') {
    return (
      <div className="space-y-6 pb-6">
        {columns.map((col) => (
          <div key={col.id} className="bg-brand-surface-container-lowest rounded-brand-2xl p-6 shadow-sm ring-1 ring-brand-outline-variant/10">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-brand-on-surface-variant text-[20px]">{col.icon}</span>
              <h3 className="font-extrabold text-brand-on-surface uppercase tracking-widest text-[12px]">{col.title}</h3>
              <span className="bg-brand-surface-container-high text-brand-on-surface-variant text-[10px] font-bold px-2 py-0.5 rounded-full ring-1 ring-brand-outline-variant/10">
                {col.tasks.length}
              </span>
            </div>
            {col.tasks.length === 0 ? (
              <p className="text-brand-on-surface-variant text-sm italic">No tasks in this status.</p>
            ) : (
              <div className="space-y-3">
                {col.tasks.map((task) => (
                  <div 
                    key={task._id} 
                    onClick={() => {
                      if (task.status === 'In Review' && task.workDescription) {
                        setViewTaskWorkDescription(task.workDescription);
                      }
                    }}
                    className={cn(
                      "flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-brand-lg bg-white ring-1 ring-brand-outline-variant/10 hover:ring-brand-outline-variant/30 transition-all",
                      task.status === 'In Review' && task.workDescription ? "cursor-pointer hover:bg-brand-surface-container-lowest" : ""
                    )}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-brand-on-surface">{task.title}</p>
                          <span className={cn(
                            "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-brand-sm ring-1",
                            task.priority === 'High' ? "bg-red-50 text-brand-error ring-brand-error/10" : 
                            task.priority === 'Medium' ? "bg-amber-50 text-amber-600 ring-amber-600/10" : "bg-blue-50 text-brand-primary ring-brand-primary/10"
                          )}>
                            {task.priority}
                          </span>
                          {task.isOverdue && task.status !== 'Done' && (
                            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-brand-sm ring-1 bg-red-100 text-red-600 ring-red-600/20">
                              Overdue
                            </span>
                          )}
                          {task.status === 'In Review' && (
                            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-brand-sm ring-1 bg-purple-50 text-purple-600 ring-purple-600/20 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[12px]">rate_review</span>
                              Submitted for Review
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-brand-on-surface-variant">
                          {task.projectId?.title || 'Personal Task'}
                        </p>
                      </div>
                    </div>
                    {task.status === 'In Review' && task.workDescription && (
                      <div className="w-full sm:w-auto mt-3 sm:mt-0 px-4 py-2 bg-brand-surface-container-lowest rounded-brand-md border border-brand-outline-variant/10">
                        <p className="text-xs text-brand-on-surface-variant italic line-clamp-2">"{task.workDescription}"</p>
                      </div>
                    )}
                    <div className="flex items-center gap-6 mt-4 sm:mt-0">
                      {task.dueDate && (
                        <div className="flex items-center gap-1.5 text-brand-on-surface-variant">
                          <span className={cn("material-symbols-outlined text-[16px]", task.isOverdue && task.status !== 'Done' ? "text-red-500" : "")}>calendar_today</span>
                          <span className={cn("text-xs", task.isOverdue && task.status !== 'Done' ? "text-red-500 font-bold" : "")}>
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {task.assignedTo && (
                        <div className="flex items-center gap-2 text-brand-on-surface-variant">
                          <div className="w-6 h-6 rounded-full bg-brand-primary-container flex items-center justify-center text-brand-on-primary-container text-[10px] font-bold uppercase" title={task.assignedTo.name}>
                            {task.assignedTo.name.substring(0, 2)}
                          </div>
                          <span className="text-xs font-medium">{task.assignedTo.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-6">
      {columns.map((col) => (
        <div 
          key={col.id} 
          className="flex flex-col"
          onDragOver={(e) => onDragOver(e, col.id)}
          onDrop={(e) => onDrop(e, col.id)}
        >
          <div className="flex items-center justify-between mb-6 px-1">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-brand-on-surface-variant text-[20px]">{col.icon}</span>
              <h3 className="font-extrabold text-brand-on-surface uppercase tracking-widest text-[10px]">{col.title}</h3>
              <span className="bg-brand-surface-container-high text-brand-on-surface-variant text-[10px] font-bold px-2 py-0.5 rounded-full ring-1 ring-brand-outline-variant/10">
                {col.tasks.length}
              </span>
            </div>
          </div>
          
          <div className="flex-1 bg-brand-surface-container-low/40 rounded-brand-full p-4 space-y-4 overflow-y-auto ring-1 ring-brand-outline-variant/5 min-h-[150px]">
            {col.tasks.map((task) => (
              <div 
                key={task._id} 
                draggable={user?.role === 'admin' || (user?.role === 'member' && task.assignedTo?._id === user._id && task.status !== 'Done')}
                onDragStart={(e) => onDragStart(e, task)}
                onClick={() => {
                  if (task.status === 'In Review' && task.workDescription) {
                    setViewTaskWorkDescription(task.workDescription);
                  }
                }}
                className={cn(
                  "bg-brand-surface-container-lowest rounded-brand-xl p-5 shadow-sm ring-1 ring-brand-outline-variant/10 transition-all duration-300 group border-l-4 border-transparent hover:border-brand-primary",
                  (user?.role === 'admin' || (user?.role === 'member' && task.assignedTo?._id === user._id && task.status !== 'Done')) ? "cursor-move hover:shadow-brand-ambient active:scale-95" : "cursor-default opacity-80",
                  task.status === 'In Review' && task.workDescription ? "cursor-pointer" : ""
                )}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-2">
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-brand-sm ring-1",
                      task.priority === 'High' ? "bg-red-50 text-brand-error ring-brand-error/10" : 
                      task.priority === 'Medium' ? "bg-amber-50 text-amber-600 ring-amber-600/10" : "bg-blue-50 text-brand-primary ring-brand-primary/10"
                    )}>
                      {task.priority}
                    </span>
                    {task.isOverdue && task.status !== 'Done' && (
                      <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-brand-sm ring-1 bg-red-100 text-red-600 ring-red-600/20">
                        Overdue
                      </span>
                    )}
                  </div>
                </div>
                
                {task.status === 'In Review' && (
                  <div className="mb-3 flex items-center gap-1.5 w-fit text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-brand-sm ring-1 bg-purple-50 text-purple-600 ring-purple-600/20">
                    <span className="material-symbols-outlined text-[12px]">rate_review</span>
                    Submitted for Review
                  </div>
                )}

                
                <h4 className="font-bold text-sm mb-1 text-brand-on-surface group-hover:text-brand-primary transition-colors">{task.title}</h4>
                <p className="text-[10px] font-black uppercase tracking-widest text-brand-on-surface-variant mb-2">
                  {task.projectId?.title || 'Personal Task'}
                </p>
                <p className="text-xs text-brand-on-surface-variant line-clamp-2 leading-relaxed mb-4">{task.description}</p>

                {task.status === 'In Review' && task.workDescription && (
                  <div className="mb-4 p-3 bg-brand-surface-container-low rounded-brand-lg border border-brand-outline-variant/5 relative">
                    <div className="absolute -top-2 left-3 bg-brand-surface-container-lowest px-1">
                      <span className="text-[8px] font-bold uppercase tracking-widest text-brand-on-surface-variant">Work Description</span>
                    </div>
                    <p className="text-xs text-brand-on-surface italic line-clamp-3 mt-1">"{task.workDescription}"</p>
                  </div>
                )}
                
                <div className="flex items-center justify-between pt-4 border-t border-brand-outline-variant/5">
                  <div className="flex items-center gap-1.5 text-brand-on-surface-variant">
                    <span className={cn("material-symbols-outlined text-[16px]", task.isOverdue && task.status !== 'Done' ? "text-red-500" : "")}>calendar_today</span>
                    <span className={cn("text-[10px] font-bold", task.isOverdue && task.status !== 'Done' ? "text-red-500" : "")}>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}</span>
                  </div>
                  {task.assignedTo && (
                    <div 
                      className="w-6 h-6 rounded-full bg-brand-primary-container flex items-center justify-center text-brand-on-primary-container text-[10px] font-bold uppercase"
                      title={task.assignedTo.name}
                    >
                      {task.assignedTo.name.substring(0, 2)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {pendingReviewTaskId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-brand-surface rounded-brand-2xl w-full max-w-md p-8 shadow-2xl ring-1 ring-white/10 animate-in zoom-in-95 duration-300">
            <h2 className="text-2xl font-black tracking-tight text-brand-on-surface mb-2">Submit for Review</h2>
            <p className="text-sm text-brand-on-surface-variant mb-6">Provide a description of the work completed for this task.</p>
            
            <div className="space-y-4">
              <textarea
                className="w-full bg-brand-surface-container-low px-4 py-3 rounded-brand-xl text-sm border border-brand-outline-variant/10 focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all min-h-[120px] resize-none"
                placeholder="What was accomplished?"
                value={workDescription}
                onChange={(e) => setWorkDescription(e.target.value)}
                autoFocus
              />
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setPendingReviewTaskId(null)}
                  className="px-4 py-2 text-sm font-bold text-brand-on-surface-variant hover:bg-brand-surface-container-high rounded-brand-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={submitForReview}
                  className="px-4 py-2 text-sm font-bold text-white bg-brand-primary hover:bg-brand-primary/90 rounded-brand-xl shadow-lg shadow-brand-primary/20 transition-all"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

export default KanbanBoard;
