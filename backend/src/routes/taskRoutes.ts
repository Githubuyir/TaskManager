import express from 'express';
import { getTasks, createTask, updateTask, deleteTask, getActivityLogs } from '../controllers/taskController';
import { protect } from '../middleware/auth';
import { adminOnly } from '../middleware/role';

const router = express.Router();

router.route('/').get(protect, getTasks).post(protect, createTask);
router.route('/activity-logs').get(protect, getActivityLogs);
router.route('/:id').put(protect, updateTask).delete(protect, adminOnly, deleteTask);

export default router;
