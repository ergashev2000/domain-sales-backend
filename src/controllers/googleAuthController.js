import GoogleAuthService from '../services/googleAuthService.js';

export const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    // Verify Google token
    const googleProfile = await GoogleAuthService.verifyGoogleToken(token);

    // Find or create user
    const user = await GoogleAuthService.findOrCreateUser(googleProfile);

    // Generate access token
    const accessToken = GoogleAuthService.generateAccessToken(user);

    res.status(200).json({
      message: 'Google authentication successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        avatarUrl: user.avatar_url,
        role: user.role
      },
      accessToken
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(400).json({ 
      error: 'Google authentication failed', 
      details: error.message 
    });
  }
};

export const googleCallback = async (req, res) => {
  try {
    const { token } = req.body;

    // Verify Google token
    const googleProfile = await GoogleAuthService.verifyGoogleToken(token);

    // Find or create user
    const user = await GoogleAuthService.findOrCreateUser(googleProfile);

    // Generate access token
    const accessToken = GoogleAuthService.generateAccessToken(user);

    // Redirect with token (for web client)
    res.redirect(`${process.env.CLIENT_REDIRECT_URL}?token=${accessToken}`);
  } catch (error) {
    console.error('Google callback error:', error);
    res.status(400).redirect(`${process.env.CLIENT_ERROR_URL}`);
  }
};
