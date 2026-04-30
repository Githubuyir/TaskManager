import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import User from './models/User';
import Workspace from './models/Workspace';
import Project from './models/Project';
import Task from './models/Task';

dotenv.config();
connectDB();

const importData = async () => {
  try {
    await User.deleteMany();
    await Workspace.deleteMany();
    await Project.deleteMany();
    await Task.deleteMany();

    // 1. Create Workspace Owner (Admin)
    const admin = new User({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin',
    });

    const workspace = await Workspace.create({
      name: 'Acme Corp',
      owner: admin._id,
      members: [admin._id],
    });

    admin.workspaceId = workspace._id;
    await admin.save();

    // 2. Create Member
    const member = new User({
      name: 'Member User',
      email: 'member@example.com',
      password: 'password123',
      role: 'member',
      workspaceId: workspace._id,
    });
    await member.save();

    workspace.members.push(member._id);
    await workspace.save();

    // 3. Create Project
    const project = await Project.create({
      title: 'Website Redesign',
      description: 'Overhaul the main marketing website',
      workspaceId: workspace._id,
      createdBy: admin._id,
      members: [admin._id, member._id],
    });

    // 4. Create Tasks
    await Task.create([
      {
        title: 'Design Mockups',
        description: 'Create Figma designs for homepage',
        priority: 'High',
        status: 'In Progress',
        dueDate: new Date(new Date().setDate(new Date().getDate() + 5)),
        assignedTo: member._id,
        projectId: project._id,
        workspaceId: workspace._id,
        createdBy: admin._id,
      },
      {
        title: 'Setup Backend repo',
        description: 'Initialize Node.js and Express app',
        priority: 'Medium',
        status: 'Done',
        assignedTo: admin._id,
        projectId: project._id,
        workspaceId: workspace._id,
        createdBy: admin._id,
      },
      {
        title: 'Copywriting',
        description: 'Write copy for the about us page',
        priority: 'Low',
        status: 'To Do',
        dueDate: new Date(new Date().setDate(new Date().getDate() - 1)), // Overdue
        projectId: project._id,
        workspaceId: workspace._id,
        createdBy: admin._id,
      }
    ]);

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await User.deleteMany();
    await Workspace.deleteMany();
    await Project.deleteMany();
    await Task.deleteMany();

    console.log('Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
