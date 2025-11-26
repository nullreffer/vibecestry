const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const UserSettings = require('../models/UserSettings');
const { requireAuth } = require('./auth');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/profiles');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `profile-${req.user.id}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Get user settings
router.get('/', requireAuth, async (req, res) => {
  try {
    let userSettings = await UserSettings.findOne({ userId: req.user.id });
    
    if (!userSettings) {
      // Create default settings if they don't exist
      userSettings = new UserSettings({
        userId: req.user.id,
        name: req.user.name,
        email: req.user.email,
        picture: req.user.picture,
        storagePreference: 'mongo'
      });
      await userSettings.save();
    }
    
    res.json({ settings: userSettings });
  } catch (error) {
    console.error('Error fetching user settings:', error);
    res.status(500).json({ error: 'Failed to fetch user settings' });
  }
});

// Update user profile
router.put('/profile', requireAuth, upload.single('profileImage'), async (req, res) => {
  try {
    const { name } = req.body;
    const updateData = { name };
    
    if (req.file) {
      updateData.customProfileImage = `/uploads/profiles/${req.file.filename}`;
    }
    
    const userSettings = await UserSettings.findOneAndUpdate(
      { userId: req.user.id },
      updateData,
      { new: true, upsert: true }
    );
    
    res.json({ 
      message: 'Profile updated successfully', 
      settings: userSettings 
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Update storage preference
router.put('/storage', requireAuth, async (req, res) => {
  try {
    const { storagePreference } = req.body;
    
    if (!['mongo', 'googledrive'].includes(storagePreference)) {
      return res.status(400).json({ error: 'Invalid storage preference' });
    }
    
    const userSettings = await UserSettings.findOneAndUpdate(
      { userId: req.user.id },
      { storagePreference },
      { new: true, upsert: true }
    );
    
    res.json({ 
      message: 'Storage preference updated successfully', 
      settings: userSettings 
    });
  } catch (error) {
    console.error('Error updating storage preference:', error);
    res.status(500).json({ error: 'Failed to update storage preference' });
  }
});

module.exports = router;