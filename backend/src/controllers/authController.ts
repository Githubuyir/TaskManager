import { Request, Response } from 'express';
import User from '../models/User';
import Workspace from '../models/Workspace';
import generateToken from '../utils/generateToken';
import { AuthRequest } from '../middleware/auth';

// @desc    Register a new admin & workspace
// @route   POST /api/auth/signup
// @access  Public
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  const { firstName, lastName, email, password, workspaceName } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    const name = `${firstName} ${lastName}`;

    // Create User (Admin)
    const user = new User({
      name,
      email,
      password,
      role: 'admin',
      workspaceId: null, // Temporary
    });

    // Create Workspace
    const workspace = await Workspace.create({
      name: workspaceName,
      owner: user._id,
      members: [user._id],
    });

    user.workspaceId = workspace._id;
    await user.save();

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      workspaceId: user.workspaceId,
      token: generateToken(user._id.toString(), user.role, workspace._id.toString()),
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const authUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await (user as any).matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        workspaceId: user.workspaceId,
        token: generateToken(user._id.toString(), user.role, user.workspaceId.toString()),
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error: any) {
    res.status(401).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
export const getUserProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

import { OAuth2Client } from 'google-auth-library';
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @desc    Auth user with Google
// @route   POST /api/auth/google
// @access  Public
export const googleAuth = async (req: Request, res: Response): Promise<void> => {
  const { idToken } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload) throw new Error('Invalid Google token');

    const { email, name, sub } = payload;
    let user = await User.findOne({ email });

    // If user doesn't exist, we could either:
    // 1. Create a new admin workspace automatically
    // 2. Reject and ask them to sign up
    // Let's create a new Admin and Workspace automatically for now
    if (!user) {
      user = new User({
        name,
        email,
        password: sub, // Dummy password, will be hashed but user will login with google
        role: 'admin',
      });
      
      const workspace = await Workspace.create({
        name: `${name}'s Workspace`,
        owner: user._id,
        members: [user._id],
      });

      user.workspaceId = workspace._id;
      await user.save();
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      workspaceId: user.workspaceId,
      token: generateToken(user._id.toString(), user.role, user.workspaceId.toString()),
    });
  } catch (error: any) {
    res.status(401).json({ message: 'Google Authentication failed', error: error.message });
  }
};
