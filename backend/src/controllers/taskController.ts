import { Response } from 'express';
import Task from '../models/Task';
import Project from '../models/Project';
import User from '../models/User';
import ActivityLog from '../models/ActivityLog';
import { AuthRequest } from '../middleware/auth';

// Valid status transitions for members (they cannot move to 'Done')
const MEMBER_ALLOWED_TRANSITIONS: Record<string, string[]> = {
  'To Do': ['In Progress', 'In Review'],
  'In Progress': ['To Do', 'In Review'],
  'In Review': ['To Do', 'In Progress'],
  'Done': [],
};

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
export const getTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId } = req.query;
    let query: any = { workspaceId: req.user.workspaceId };

    if (req.user.role === 'member') {
      // Members only see tasks for projects they are part of OR personal tasks assigned to them
      const userProjects = await Project.find({ members: req.user._id });
      const projectIds = userProjects.map((p) => p._id);
      
      // If a specific projectId is requested, filter by it only if member is part of it
      if (projectId) {
        const hasAccess = projectIds.some(id => id.toString() === projectId);
        if (hasAccess) {
          query.projectId = projectId;
        } else {
          // Deny access by querying an invalid ID
          query.projectId = '000000000000000000000000';
        }
      } else {
        query.assignedTo = req.user._id;
      }
    } else {
      if (projectId) {
        query.projectId = projectId;
      }
    }

    const tasks = await Task.find(query).populate('assignedTo', 'name email').populate('projectId', 'title');
    
    // Calculate overdue status dynamically
    const now = new Date();
    const tasksWithOverdue = tasks.map(task => {
      const isOverdue = task.dueDate && new Date(task.dueDate) < now && task.status !== 'Done';
      return { ...task.toObject(), isOverdue };
    });

    res.json(tasksWithOverdue);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a task
// @route   POST /api/tasks
export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
  const { title, description, priority, status, dueDate, assignedTo, projectId } = req.body;
  try {
    let taskAssignedTo = assignedTo;

    if (projectId) {
      // Verify project belongs to workspace
      const project = await Project.findById(projectId);
      if (!project || project.workspaceId.toString() !== req.user.workspaceId.toString()) {
        res.status(404);
        throw new Error('Project not found or not authorized');
      }

      // Verify assigned user is part of the workspace
      if (taskAssignedTo) {
        const userToAssign = await User.findOne({ _id: taskAssignedTo, workspaceId: req.user.workspaceId });
        if (!userToAssign) {
          res.status(400);
          throw new Error('Assigned user must be a member of this workspace');
        }

        // Automatically add user to project members if not already present
        if (!project.members.includes(taskAssignedTo)) {
          project.members.push(taskAssignedTo);
          await project.save();
        }
      }
    } else {
      // Personal task logic
      if (req.user.role === 'member') {
        taskAssignedTo = req.user._id; // Members can only create personal tasks for themselves
      }
    }

    const task = new Task({
      title,
      description,
      priority,
      status,
      dueDate,
      assignedTo: taskAssignedTo,
      projectId: projectId || undefined,
      workspaceId: req.user.workspaceId,
      createdBy: req.user._id,
    });

    const createdTask = await task.save();

    // Log activity
    await ActivityLog.create({
      user: req.user._id,
      action: 'created',
      taskId: createdTask._id,
      taskTitle: createdTask.title,
      details: `created task "${createdTask.title}"`,
      workspaceId: req.user.workspaceId,
    });

    res.status(201).json(createdTask);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
  const { title, description, priority, status, dueDate, assignedTo } = req.body;

  try {
    const task = await Task.findById(req.params.id);

    if (task) {
      if (task.workspaceId.toString() !== req.user.workspaceId.toString()) {
        res.status(403);
        throw new Error('Not authorized to access this task');
      }

      const oldStatus = task.status;

      // If member, only allow status update with restrictions
      if (req.user.role === 'member') {
        if (status && status !== oldStatus) {
          // Members can only move their own assigned tasks
          if (!task.assignedTo || task.assignedTo.toString() !== req.user._id.toString()) {
            res.status(403).json({ message: 'You can only move tasks assigned to you' });
            return;
          }

          // Members cannot move tasks to 'Done'
          if (status === 'Done') {
            res.status(403).json({ message: 'Only admins can move tasks to Done' });
            return;
          }

          // Check allowed transitions
          const allowed = MEMBER_ALLOWED_TRANSITIONS[oldStatus] || [];
          if (!allowed.includes(status)) {
            res.status(403).json({ message: `Cannot move task from "${oldStatus}" to "${status}"` });
            return;
          }

          if (status === 'In Review') {
            if (!req.body.workDescription || req.body.workDescription.trim() === '') {
              res.status(400).json({ message: 'Work description is required to submit for review' });
              return;
            }
            task.workDescription = req.body.workDescription;
          }

          task.status = status;
        }
      } else {
        // Admin can update everything
        task.title = title || task.title;
        task.description = description || task.description;
        task.priority = priority || task.priority;
        task.status = status || task.status;
        task.dueDate = dueDate || task.dueDate;
        
        if (assignedTo) {
          const userToAssign = await User.findOne({ _id: assignedTo, workspaceId: req.user.workspaceId });
          if (!userToAssign) {
            res.status(400);
            throw new Error('Assigned user must be a member of this workspace');
          }

          const project = await Project.findById(task.projectId);
          if (project) {
            // Automatically add user to project members if not already present
            if (!project.members.includes(assignedTo)) {
              project.members.push(assignedTo);
              await project.save();
            }
          }
          task.assignedTo = assignedTo;
        }
      }

      const updatedTask = await task.save();

      // Log activity if status changed
      if (status && status !== oldStatus) {
        await ActivityLog.create({
          user: req.user._id,
          action: 'moved',
          taskId: updatedTask._id,
          taskTitle: updatedTask.title,
          details: `moved "${updatedTask.title}" from ${oldStatus} to ${status}`,
          workspaceId: req.user.workspaceId,
        });
      }

      res.json(updatedTask);
    } else {
      res.status(404);
      throw new Error('Task not found');
    }
  } catch (error: any) {
    if (!res.headersSent) {
      res.status(500).json({ message: error.message });
    }
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private/Admin
export const deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const task = await Task.findById(req.params.id);

    if (task) {
      if (task.workspaceId.toString() !== req.user.workspaceId.toString()) {
        res.status(403);
        throw new Error('Not authorized to access this task');
      }

      // Log activity before deletion
      await ActivityLog.create({
        user: req.user._id,
        action: 'deleted',
        taskId: task._id,
        taskTitle: task.title,
        details: `deleted task "${task.title}"`,
        workspaceId: req.user.workspaceId,
      });

      await task.deleteOne();
      res.json({ message: 'Task removed' });
    } else {
      res.status(404);
      throw new Error('Task not found');
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get activity logs for workspace
// @route   GET /api/tasks/activity-logs
// @access  Private
export const getActivityLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    let query: any = { workspaceId: req.user.workspaceId };

    if (req.user.role === 'member') {
      const admins = await User.find({ workspaceId: req.user.workspaceId, role: 'admin' }).select('_id');
      const adminIds = admins.map(a => a._id);
      query.user = { $in: [req.user._id, ...adminIds] };
    }

    const logs = await ActivityLog.find(query)
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
