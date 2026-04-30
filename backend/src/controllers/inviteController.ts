import { Request, Response } from 'express';
import crypto from 'crypto';
import Invite from '../models/Invite';
import User from '../models/User';
import Workspace from '../models/Workspace';
import generateToken from '../utils/generateToken';
import { sendInviteEmail } from '../utils/sendEmail';
import { AuthRequest } from '../middleware/auth';

// @desc    Create an invite & send email via SendGrid
// @route   POST /api/invites
// @access  Private/Admin
export const createInvite = async (req: AuthRequest, res: Response): Promise<void> => {
  const { email } = req.body;

  try {
    // Check if user already exists in the same workspace
    const userExists = await User.findOne({ email, workspaceId: req.user.workspaceId });
    if (userExists) {
      res.status(400).json({ message: 'This user is already a member of your workspace' });
      return;
    }

    // If an active invite already exists, we delete it and send a fresh one
    await Invite.deleteMany({
      email,
      workspaceId: req.user.workspaceId,
      status: 'pending'
    });

    const inviteToken = crypto.randomBytes(20).toString('hex');

    // Set expiration to 7 days
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invite = await Invite.create({
      email,
      workspaceId: req.user.workspaceId,
      inviteToken,
      expiresAt,
    });

    // Build the accept-invite URL (matches frontend route: /accept-invite/:token)
    const inviteLink = `${process.env.FRONTEND_URL}/accept-invite/${inviteToken}`;

    // Get workspace name and inviter name for the email
    const workspace = await Workspace.findById(req.user.workspaceId);
    const inviter = await User.findById(req.user._id);

    // Send email via SendGrid
    try {
      await sendInviteEmail({
        to: email,
        workspaceName: workspace?.name || 'TeamTask Workspace',
        inviterName: inviter?.name || 'Your admin',
        inviteLink,
      });
    } catch (emailError: any) {
      // If email fails, delete the invite and inform the user
      await Invite.findByIdAndDelete(invite._id);
      console.error('Email send failed:', emailError.message);
      res.status(500).json({
        message: `Failed to send invitation email: ${emailError.message}. Please check your SendGrid configuration.`,
      });
      return;
    }

    res.status(201).json({
      message: 'Invitation email sent successfully!',
      inviteLink,
      inviteToken,
    });
  } catch (error: any) {
    console.error('Create invite error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get invite info
// @route   GET /api/invites/:token
// @access  Public
export const getInvite = async (req: Request, res: Response): Promise<void> => {
  try {
    const invite = await Invite.findOne({
      inviteToken: req.params.token,
      status: 'pending',
      expiresAt: { $gt: new Date() },
    }).populate('workspaceId', 'name');

    if (invite) {
      res.json({
        email: invite.email,
        workspace: (invite.workspaceId as any).name,
      });
    } else {
      res.status(404).json({ message: 'Invalid or expired invite' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Accept invite & create member account
// @route   POST /api/invites/accept
// @access  Public
export const acceptInvite = async (req: Request, res: Response): Promise<void> => {
  const { token, firstName, lastName, password } = req.body;

  try {
    const invite = await Invite.findOne({
      inviteToken: token,
      status: 'pending',
      expiresAt: { $gt: new Date() },
    });

    if (!invite) {
      res.status(400).json({ message: 'Invalid or expired invite' });
      return;
    }

    // Check if user with this email already exists
    const existingUser = await User.findOne({ email: invite.email });
    if (existingUser) {
      // If the user already exists but isn't in this workspace, add them
      if (existingUser.workspaceId.toString() !== invite.workspaceId.toString()) {
        res.status(400).json({
          message: 'An account with this email already exists. Please log in instead.',
        });
        return;
      }
      res.status(400).json({ message: 'You are already a member of this workspace' });
      return;
    }

    const name = `${firstName} ${lastName}`;

    const user = new User({
      name,
      email: invite.email,
      password,
      role: 'member',
      workspaceId: invite.workspaceId,
    });

    await user.save();

    // Add user to workspace
    const workspace = await Workspace.findById(invite.workspaceId);
    if (workspace) {
      workspace.members.push(user._id);
      await workspace.save();
    }

    // Mark invite as accepted
    invite.status = 'accepted';
    await invite.save();

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      workspaceId: user.workspaceId,
      token: generateToken(user._id.toString(), user.role, user.workspaceId.toString()),
    });
  } catch (error: any) {
    console.error('Accept invite error:', error);
    res.status(500).json({ message: error.message });
  }
};
