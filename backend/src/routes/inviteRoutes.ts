import express from 'express';
import { createInvite, getInvite, acceptInvite } from '../controllers/inviteController';
import { protect } from '../middleware/auth';
import { adminOnly } from '../middleware/role';

const router = express.Router();

router.post('/', protect, adminOnly, createInvite);
router.get('/:token', getInvite);
router.post('/accept', acceptInvite);

export default router;
