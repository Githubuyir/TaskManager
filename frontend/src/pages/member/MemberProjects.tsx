import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectService } from '../../services/projectService';
import { cn } from '../../utils/cn';

interface Project {
  _id: string;
  title: string;
  description?: string;
  members: { _id: string; name: string; email: string }[];
  taskCount: number;
  progress: number;
}

const MemberProjects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await projectService.getProjects();
      setProjects(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Error fetching projects:', err);
      setError(err.response?.data?.message || 'Failed to load projects. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return 'bg-green-500';
    if (progress >= 40) return 'bg-amber-500';
    return 'bg-brand-primary';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <p className="text-sm text-brand-on-surface-variant max-w-md mb-6">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-brand-on-background">My Projects</h1>
          <p className="text-brand-on-surface-variant">
            {projects.length} project{projects.length !== 1 ? 's' : ''} you are part of
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full md:w-auto">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-brand-on-surface-variant text-[20px]">search</span>
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-brand-surface-container-low rounded-brand-xl text-sm border border-brand-outline-variant/10 focus:ring-2 focus:ring-brand-primary/20 outline-none w-full md:w-64 transition-all focus:border-brand-primary/30"
            />
          </div>
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <span className="material-symbols-outlined text-5xl text-brand-on-surface-variant/30 mb-4">search_off</span>
          <p className="text-sm font-bold text-brand-on-surface">No projects found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProjects.map((project, i) => (
            <div
              key={project._id}
              onClick={() => navigate(`/member/projects/${project._id}`)}
              className={cn(
                "bg-brand-surface-container-lowest rounded-brand-full p-6 shadow-sm ring-1 ring-brand-outline-variant/10",
                "hover:shadow-brand-ambient hover:ring-brand-primary/20 transition-all duration-300 cursor-pointer group",
                "animate-in slide-in-from-bottom-4 relative overflow-hidden"
              )}
              style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'backwards' }}
            >
              <div className="absolute top-0 left-0 right-0 h-1 btn-primary-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-brand-xl bg-brand-primary/10 ring-1 ring-brand-primary/15 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-primary/15 transition-colors">
                    <span className="material-symbols-outlined text-brand-primary text-[20px]">account_tree</span>
                  </div>
                  <h3 className="text-base font-bold text-brand-on-surface truncate group-hover:text-brand-primary transition-colors">
                    {project.title}
                  </h3>
                </div>
              </div>

              <p className="text-xs text-brand-on-surface-variant line-clamp-2 leading-relaxed mb-5 min-h-[2rem]">
                {project.description || 'No description provided'}
              </p>

              <div className="mb-5">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-brand-on-surface-variant">Progress</span>
                  <span className="text-[10px] font-bold text-brand-on-surface">{project.progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-brand-surface-container-high rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-700", getProgressColor(project.progress))}
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-brand-outline-variant/5">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-brand-on-surface-variant">
                    <span className="material-symbols-outlined text-[16px]">group</span>
                    <span className="text-xs font-bold">{project.members?.length || 0}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-brand-on-surface-variant">
                    <span className="material-symbols-outlined text-[16px]">task_alt</span>
                    <span className="text-xs font-bold">{project.taskCount || 0} tasks</span>
                  </div>
                </div>
                <div className="flex -space-x-2">
                  {(project.members || []).slice(0, 3).map((member) => (
                    <div
                      key={member._id}
                      className="w-7 h-7 rounded-full bg-brand-primary-container flex items-center justify-center text-[10px] font-bold text-brand-on-primary-container ring-2 ring-brand-surface-container-lowest"
                      title={member.name}
                    >
                      {member.name?.substring(0, 2).toUpperCase()}
                    </div>
                  ))}
                  {(project.members?.length || 0) > 3 && (
                    <div className="w-7 h-7 rounded-full bg-brand-surface-container-high flex items-center justify-center text-[10px] font-bold text-brand-on-surface-variant ring-2 ring-brand-surface-container-lowest">
                      +{project.members.length - 3}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MemberProjects;
