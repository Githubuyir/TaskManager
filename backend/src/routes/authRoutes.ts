import express from 'express';
import { registerUser, authUser, getUserProfile, googleAuth } from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.post('/signup', registerUser);
router.post('/login', authUser);
router.post('/google', googleAuth);
router.get('/me', protect, getUserProfile);

export default router;
