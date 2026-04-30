import { Response } from 'express';
import Project from '../models/Project';
import Task from '../models/Task';
import { AuthRequest } from '../middleware/auth';

// @desc    Get all projects for user workspace
// @route   GET /api/projects
// @access  Private
export const getProjects = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let projects;
    if (req.user.role === 'admin') {
      projects = await Project.find({ workspaceId: req.user.workspaceId }).populate('members', 'name email');
    } else {
      projects = await Project.find({
        workspaceId: req.user.workspaceId,
        members: req.user._id,
      }).populate('members', 'name email');
    }

    // Calculate progress for each project
    const projectsWithProgress = await Promise.all(
      projects.map(async (project) => {
        const tasks = await Task.find({ projectId: project._id });
        const totalTasks = tasks.length;
        const doneTasks = tasks.filter((task) => task.status === 'Done').length;
        const progress = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);

        return {
          ...project.toObject(),
          progress,
          taskCount: totalTasks,
        };
      })
    );

    res.json(projectsWithProgress);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single project
// @route   GET /api/projects/:id
// @access  Private
export const getProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const project = await Project.findById(req.params.id).populate('members', 'name email');

    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    if (project.workspaceId.toString() !== req.user.workspaceId.toString()) {
      res.status(403).json({ message: 'Not authorized to access this project' });
      return;
    }

    const tasks = await Task.find({ projectId: project._id });
    const totalTasks = tasks.length;
    const doneTasks = tasks.filter((task) => task.status === 'Done').length;
    const progress = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);

    res.json({
      ...project.toObject(),
      progress,
      taskCount: totalTasks,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a project
// @route   POST /api/projects
// @access  Private/Admin
export const createProject = async (req: AuthRequest, res: Response): Promise<void> => {
  const { title, description, members } = req.body;

  try {
    const project = new Project({
      title,
      description,
      workspaceId: req.user.workspaceId,
      createdBy: req.user._id,
      members: members || [],
    });

    const createdProject = await project.save();
    res.status(201).json(createdProject);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private/Admin
export const updateProject = async (req: AuthRequest, res: Response): Promise<void> => {
  const { title, description, members } = req.body;

  try {
    const project = await Project.findById(req.params.id);

    if (project) {
      if (project.workspaceId.toString() !== req.user.workspaceId.toString()) {
        res.status(403);
        throw new Error('Not authorized to access this project');
      }

      project.title = title || project.title;
      project.description = description || project.description;
      if (members) project.members = members;

      const updatedProject = await project.save();
      res.json(updatedProject);
    } else {
      res.status(404);
      throw new Error('Project not found');
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private/Admin
export const deleteProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const project = await Project.findById(req.params.id);

    if (project) {
      if (project.workspaceId.toString() !== req.user.workspaceId.toString()) {
        res.status(403);
        throw new Error('Not authorized to access this project');
      }

      await project.deleteOne();
      // Also delete associated tasks
      await Task.deleteMany({ projectId: req.params.id });

      res.json({ message: 'Project removed' });
    } else {
      res.status(404);
      throw new Error('Project not found');
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
