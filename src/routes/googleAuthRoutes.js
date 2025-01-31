import express from 'express';
import axios from 'axios';
import * as GoogleAuthController from '../controllers/googleAuthController.js';
import { 
  GOOGLE_CLIENT_ID, 
  GOOGLE_CLIENT_SECRET, 
  CLIENT_REDIRECT_URL 
} from '../environments/auth_env.js';

const router = express.Router();

/**
 * Initiate Google OAuth Authorization
 * Redirects user to Google's OAuth consent screen
 */
router.get('/authorize', (req, res) => {
  const redirectUri = 'https://accounts.google.com/o/oauth2/v2/auth';
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: `${CLIENT_REDIRECT_URL}/auth/google/callback`,
    response_type: 'code',
    scope: 'openid profile email',
    access_type: 'offline',
    prompt: 'consent'
  });
  
  res.redirect(`${redirectUri}?${params.toString()}`);
});

/**
 * Handle Google Login via ID Token
 */
router.post('/login', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ 
        error: 'No token provided',
        details: 'Google ID token is required' 
      });
    }

    const result = await GoogleAuthController.googleLogin(req, res);
    return result;
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ 
      error: 'Authentication failed', 
      details: error.message 
    });
  }
});

/**
 * Google OAuth Callback Handler
 * Exchanges authorization code for access token and user info
 */
router.get('/callback', async (req, res) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      return res.status(400).json({ error: 'No authorization code provided' });
    }

    // Exchange code for tokens
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: `${CLIENT_REDIRECT_URL}/auth/google/callback`,
      grant_type: 'authorization_code'
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const { access_token } = tokenResponse.data;

    // Fetch user profile
    const profileResponse = await axios.get(
      'https://www.googleapis.com/oauth2/v3/userinfo', 
      { headers: { Authorization: `Bearer ${access_token}` } }
    );

    // Use existing controller method to handle user creation/login
    const user = await GoogleAuthController.handleGoogleUser(profileResponse.data);

    // Redirect to frontend with token
    res.redirect(`${CLIENT_REDIRECT_URL}?token=${user.accessToken}`);

  } catch (error) {
    console.error('Google OAuth Error:', error.response ? error.response.data : error.message);
    res.status(500).redirect(`${CLIENT_REDIRECT_URL}/login/error`);
  }
});

export default router;
