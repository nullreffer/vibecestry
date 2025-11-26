const express = require('express');
const passport = require('../auth/passport');
const router = express.Router();

// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  
  // Store the original URL they were trying to access
  req.session.returnTo = req.originalUrl;
  
  // Redirect to Google OAuth
  res.redirect('/auth/google');
};

// Route to start Google OAuth flow
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

// Google OAuth callback route
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/auth/error' }),
  (req, res) => {
    // Successful authentication
    const redirectTo = req.session.returnTo || '/';
    delete req.session.returnTo;
    
    // Redirect to frontend with success
    res.redirect(`http://localhost:3000${redirectTo}?auth=success`);
  }
);

// Route to check authentication status
router.get('/status', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      authenticated: true,
      user: req.user
    });
  } else {
    res.json({
      authenticated: false
    });
  }
});

// Route to get current user info
router.get('/user', requireAuth, (req, res) => {
  res.json({
    user: req.user
  });
});

// Route to logout
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    
    // Destroy the session completely
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: 'Session destruction failed' });
      }
      
      // Clear the session cookie
      res.clearCookie('connect.sid');
      res.json({ message: 'Logged out successfully' });
    });
  });
});

// Error route
router.get('/error', (req, res) => {
  res.redirect('http://localhost:3000/auth-error');
});

module.exports = { router, requireAuth };