import { Response } from 'express';
import User from '../models/User';
import Workspace from '../models/Workspace';
import { AuthRequest } from '../middleware/auth';
import bcrypt from 'bcryptjs';

// @desc    Get all workspace members
// @route   GET /api/users/workspace-members
// @access  Private
export const getWorkspaceMembers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const workspace = await Workspace.findById(req.user.workspaceId).populate(
      'members',
      'name email role createdAt'
    );

    if (workspace) {
      res.json(workspace.members);
    } else {
      res.status(404).json({ message: 'Workspace not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove a member from the workspace
// @route   DELETE /api/users/:id
// @access  Private (Admin only)
export const removeMember = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Only admins can remove members
    if (req.user.role !== 'admin') {
      res.status(403).json({ message: 'Not authorized. Admin access required.' });
      return;
    }

    const targetId = req.params.id;

    // Admin cannot remove themselves
    if (targetId === req.user._id.toString()) {
      res.status(400).json({ message: 'You cannot remove yourself from the workspace.' });
      return;
    }

    const workspace = await Workspace.findById(req.user.workspaceId);
    if (!workspace) {
      res.status(404).json({ message: 'Workspace not found' });
      return;
    }

    // Check target user is in this workspace
    const isMember = workspace.members.some((m: any) => m.toString() === targetId);
    if (!isMember) {
      res.status(404).json({ message: 'Member not found in workspace' });
      return;
    }

    // Remove from workspace members array
    workspace.members = workspace.members.filter((m: any) => m.toString() !== targetId) as any;
    await workspace.save();

    res.json({ message: 'Member removed successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a member's role
// @route   PUT /api/users/:id/role
// @access  Private (Admin only)
export const updateMemberRole = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Only admins can change roles
    if (req.user.role !== 'admin') {
      res.status(403).json({ message: 'Not authorized. Admin access required.' });
      return;
    }

    const targetId = req.params.id;
    const { role } = req.body;

    // Admin cannot change their own role
    if (targetId === req.user._id.toString()) {
      res.status(400).json({ message: 'You cannot change your own role.' });
      return;
    }

    if (!role || !['admin', 'member'].includes(role)) {
      res.status(400).json({ message: 'Invalid role. Must be "admin" or "member".' });
      return;
    }

    const workspace = await Workspace.findById(req.user.workspaceId);
    if (!workspace) {
      res.status(404).json({ message: 'Workspace not found' });
      return;
    }

    // Check target is in this workspace
    const isMember = workspace.members.some((m: any) => m.toString() === targetId);
    if (!isMember) {
      res.status(404).json({ message: 'Member not found in workspace' });
      return;
    }

    const targetUser = await User.findById(targetId);
    if (!targetUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    targetUser.role = role;
    await targetUser.save();

    res.json({ message: 'Role updated successfully', user: { _id: targetUser._id, role: targetUser.role } });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile (name)
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const { name } = req.body;
    if (name) {
      user.name = name;
    }

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Change user password
// @route   PUT /api/users/change-password
// @access  Private
export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmPassword) {
      res.status(400).json({ message: 'Please provide all password fields' });
      return;
    }

    if (newPassword !== confirmPassword) {
      res.status(400).json({ message: 'New password and confirm password do not match' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ message: 'Password must be at least 6 characters' });
      return;
    }

    // Verify old password
    const isMatch = await (user as any).matchPassword(oldPassword);
    if (!isMatch) {
      res.status(401).json({ message: 'Current password is incorrect' });
      return;
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get workspace settings
// @route   GET /api/users/workspace-settings
// @access  Private
export const getWorkspaceSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const workspace = await Workspace.findById(req.user.workspaceId);
    if (!workspace) {
      res.status(404).json({ message: 'Workspace not found' });
      return;
    }

    res.json({
      _id: workspace._id,
      name: workspace.name,
      description: (workspace as any).description || '',
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update workspace settings
// @route   PUT /api/users/workspace-settings
// @access  Private (Admin only)
export const updateWorkspaceSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user.role !== 'admin') {
      res.status(403).json({ message: 'Not authorized. Admin access required.' });
      return;
    }

    const workspace = await Workspace.findById(req.user.workspaceId);
    if (!workspace) {
      res.status(404).json({ message: 'Workspace not found' });
      return;
    }

    const { name, description } = req.body;
    if (name) workspace.name = name;
    if (description !== undefined) (workspace as any).description = description;

    await workspace.save();

    res.json({
      _id: workspace._id,
      name: workspace.name,
      description: (workspace as any).description || '',
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
