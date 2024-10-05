import express from 'express';
import { registerUser, loginUser, logoutUser } from '../controllers/authController.js';
import { protect, authorizeRoles } from '../middlewares/auth.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

router.get('/logout', protect, logoutUser);

router.get('/verify-admin', protect, authorizeRoles('admin'), (req, res) => {
  res.send('you are an admin');
});
router.get('/verify-token', protect, (req, res) => {
  res.send('you are authenticated');
});

export default router;
