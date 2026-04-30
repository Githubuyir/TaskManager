import { useState, useEffect } from 'react';
import { Button, Input } from '../ui';
import { taskService } from '../../services/taskService';
import { projectService } from '../../services/projectService';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  projectId?: string;
  isPersonal?: boolean;
}

export const CreateTaskModal = ({ isOpen, onClose, onSuccess, projectId, isPersonal }: CreateTaskModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: projectId || '',
    priority: 'Medium',
    dueDate: '',
    status: 'To Do'
  });
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && !projectId && !isPersonal) {
      const fetchProjects = async () => {
        try {
          const data = await projectService.getProjects();
          setProjects(data);
          if (data.length > 0 && !formData.projectId) {
            setFormData(prev => ({ ...prev, projectId: data[0]._id }));
          }
        } catch (err) {
          console.error('Failed to fetch projects:', err);
        }
      };
      fetchProjects();
    }
  }, [isOpen, projectId, isPersonal]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.projectId && !isPersonal) {
      setError('Please select a project');
      return;
    }

    try {
      setIsLoading(true);
      const payload = { ...formData };
      if (isPersonal) {
        delete (payload as any).projectId;
      }
      await taskService.createTask(payload);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create task');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-brand-surface rounded-brand-2xl w-full max-w-md p-8 shadow-2xl ring-1 ring-white/10 animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black tracking-tight text-brand-on-surface">New Task</h2>
          <button onClick={onClose} className="p-2 hover:bg-brand-surface-container-high rounded-full transition-colors">
            <span className="material-symbols-outlined text-brand-on-surface-variant">close</span>
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-brand-xl text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {!projectId && !isPersonal && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-on-surface-variant ml-1">
                Select Project
              </label>
              <select
                className="w-full bg-brand-surface-container-low px-4 py-3 rounded-brand-xl text-sm border border-brand-outline-variant/10 focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                value={formData.projectId}
                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                required
              >
                <option value="" disabled>Choose a project...</option>
                {projects.map(p => (
                  <option key={p._id} value={p._id}>{p.title}</option>
                ))}
              </select>
            </div>
          )}

          <Input
            label="Task Title"
            placeholder="e.g. Design Login Screen"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-brand-on-surface-variant ml-1">
              Description
            </label>
            <textarea
              className="w-full bg-brand-surface-container-low px-4 py-3 rounded-brand-xl text-sm border border-brand-outline-variant/10 focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all min-h-[80px] resize-none"
              placeholder="What needs to be done?"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-on-surface-variant ml-1">
                Priority
              </label>
              <select
                className="w-full bg-brand-surface-container-low px-4 py-3 rounded-brand-xl text-sm border border-brand-outline-variant/10 focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <Input
              type="date"
              label="Due Date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            />
          </div>

          <div className="pt-2 flex gap-3">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-[2] btn-primary-gradient shadow-lg shadow-brand-primary/20">
              {isLoading ? 'Creating...' : 'Add Task'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
