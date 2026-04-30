import { useState } from 'react';
import { Button } from '../../components/ui';
import KanbanBoard from '../../components/shared/KanbanBoard';
import { CreateTaskModal } from '../../components/modals/CreateTaskModal';

const MemberTasks = () => {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTaskCreated = () => {
    setRefreshKey(prev => prev + 1);
  };
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [isViewMenuOpen, setIsViewMenuOpen] = useState(false);

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-brand-on-background">My Personal Workspace</h1>
          <p className="text-brand-on-surface-variant">Your active task queue and collaboration milestones.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full md:w-auto">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-brand-on-surface-variant text-[20px]">search</span>
            <input 
              type="text" 
              placeholder="Find a task..." 
              className="pl-10 pr-4 py-2 bg-brand-surface-container-low rounded-brand-xl text-sm border border-brand-outline-variant/10 focus:ring-2 focus:ring-brand-primary/20 outline-none w-full md:w-64 transition-all focus:border-brand-primary/30"
            />
          </div>
          <Button 
            onClick={() => setIsTaskModalOpen(true)}
            size="sm" 
            className="gap-2 btn-primary-gradient shadow-lg shadow-brand-primary/20"
          >
            <span className="material-symbols-outlined text-[18px]">add</span> Personal Task
          </Button>
          
          <div className="relative">
            <Button 
              variant="secondary" 
              size="sm" 
              className="gap-2"
              onClick={() => setIsViewMenuOpen(!isViewMenuOpen)}
            >
              <span className="material-symbols-outlined text-[18px]">
                {viewMode === 'kanban' ? 'view_kanban' : 'view_list'}
              </span>
              View
            </Button>
            {isViewMenuOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-brand-xl shadow-lg ring-1 ring-black/5 z-10 py-1">
                <button
                  className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-brand-surface-container-low transition-colors ${viewMode === 'kanban' ? 'text-brand-primary font-bold' : 'text-brand-on-surface'}`}
                  onClick={() => { setViewMode('kanban'); setIsViewMenuOpen(false); }}
                >
                  <span className="material-symbols-outlined text-[18px]">view_kanban</span> Kanban View
                </button>
                <button
                  className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-brand-surface-container-low transition-colors ${viewMode === 'list' ? 'text-brand-primary font-bold' : 'text-brand-on-surface'}`}
                  onClick={() => { setViewMode('list'); setIsViewMenuOpen(false); }}
                >
                  <span className="material-symbols-outlined text-[18px]">view_list</span> List View
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <KanbanBoard key={refreshKey} viewMode={viewMode} />
      </div>

      <CreateTaskModal 
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSuccess={handleTaskCreated}
        isPersonal={true}
      />
    </div>
  );
};

export default MemberTasks;
