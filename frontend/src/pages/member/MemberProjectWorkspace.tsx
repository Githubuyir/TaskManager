import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectService } from '../../services/projectService';
import KanbanBoard from '../../components/shared/KanbanBoard';

interface Member {
  _id: string;
  name: string;
  email: string;
}

interface Project {
  _id: string;
  title: string;
  description?: string;
  members: Member[];
}

const MemberProjectWorkspace = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjectData = useCallback(async () => {
    if (!projectId) return;
    try {
      setIsLoading(true);
      setError(null);
      
      const projectsData = await projectService.getProjects();
      const projectData = (Array.isArray(projectsData) ? projectsData : [])
        .find((p: any) => p._id === projectId);

      if (!projectData) {
        setError('Project not found or you do not have access to it.');
        return;
      }
      setProject(projectData);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <p className="text-sm text-brand-on-surface-variant max-w-md mb-6">{error || 'Project not found'}</p>
        <button onClick={() => navigate('/member/projects')} className="text-brand-primary hover:underline">
          Back to My Projects
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div>
        <button
          onClick={() => navigate('/member/projects')}
          className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-brand-on-surface-variant hover:text-brand-primary transition-colors mb-4 group"
        >
          <span className="material-symbols-outlined text-[16px] group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
          My Projects
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
          </div>
        </div>
      </div>

      <KanbanBoard projectId={projectId} />
    </div>
  );
};

export default MemberProjectWorkspace;
