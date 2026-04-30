import express from 'express';
import { 
  getWorkspaceMembers, 
  removeMember, 
  updateMemberRole,
  updateProfile,
  changePassword,
  getWorkspaceSettings,
  updateWorkspaceSettings
} from '../controllers/userController';
import { protect } from '../middleware/auth';
import { adminOnly } from '../middleware/role';

const router = express.Router();

router.get('/workspace-members', protect, getWorkspaceMembers);
router.get('/workspace-settings', protect, getWorkspaceSettings);
router.put('/workspace-settings', protect, adminOnly, updateWorkspaceSettings);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

router.delete('/:id', protect, adminOnly, removeMember);
router.put('/:id/role', protect, adminOnly, updateMemberRole);

export default router;
