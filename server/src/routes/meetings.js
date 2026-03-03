import express from 'express';
import { randomBytes } from 'crypto';
import Meeting from '../models/Meeting.js';
import User from '../models/User.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Create a new meeting room
router.post('/create', verifyToken, async (req, res) => {
  try {
    const { title, description } = req.body;
    const roomId = randomBytes(6).toString('hex').toUpperCase();

    const meeting = await Meeting.create({
      roomId,
      createdBy: req.userId,
      title: title || 'Video Meeting',
      description: description || '',
    });

    res.status(201).json({
      success: true,
      message: 'Meeting room created',
      meeting,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating meeting',
      error: error.message,
    });
  }
});

// Get meeting by room ID
router.get('/room/:roomId', verifyToken, async (req, res) => {
  try {
    const meeting = await Meeting.findOne({
      roomId: req.params.roomId,
    }).populate('createdBy', 'username displayName avatar');

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found',
      });
    }

    res.status(200).json({
      success: true,
      meeting,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching meeting',
      error: error.message,
    });
  }
});

// Get user's meetings
router.get('/user/history', verifyToken, async (req, res) => {
  try {
    const meetings = await Meeting.find({
      createdBy: req.userId,
    })
      .populate('createdBy', 'username displayName avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      meetings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching meetings',
      error: error.message,
    });
  }
});

export default router;
