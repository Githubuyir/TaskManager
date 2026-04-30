import express from 'express';
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} from '../controllers/projectController';
import { protect } from '../middleware/auth';
import { adminOnly } from '../middleware/role';

const router = express.Router();

router.route('/').get(protect, getProjects).post(protect, adminOnly, createProject);
router.route('/:id').get(protect, getProject).put(protect, adminOnly, updateProject).delete(protect, adminOnly, deleteProject);

export default router;
