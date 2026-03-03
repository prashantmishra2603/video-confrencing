import express from 'express';
import User from '../models/User.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Get all online users
router.get('/online', verifyToken, async (req, res) => {
  try {
    const users = await User.find({ isOnline: true }).select('-password');

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching online users',
      error: error.message,
    });
  }
});

// Get user by ID
router.get('/:userId', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message,
    });
  }
});

// Update user profile
router.put('/:userId', verifyToken, async (req, res) => {
  try {
    if (req.userId !== req.params.userId && req.userId.toString() !== req.params.userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to update this profile',
      });
    }

    const { displayName, avatar } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      {
        displayName,
        avatar,
      },
      { new: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message,
    });
  }
});

export default router;
