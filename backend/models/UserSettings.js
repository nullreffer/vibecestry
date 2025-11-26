const mongoose = require('mongoose');

const userSettingsSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  picture: {
    type: String,
    required: true
  },
  storagePreference: {
    type: String,
    enum: ['mongo', 'googledrive'],
    default: 'mongo'
  },
  customProfileImage: {
    type: String,
    default: null
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'dark'
    },
    notifications: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true,
  collection: 'vibecestrysettings'
});

module.exports = mongoose.model('UserSettings', userSettingsSchema);