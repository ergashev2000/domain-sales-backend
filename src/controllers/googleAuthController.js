import GoogleAuthService from '../services/googleAuthService.js';

export const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        error: 'Authentication failed',
        details: 'Google token is required'
      });
    }

    let googleProfile;
    try {
      googleProfile = await GoogleAuthService.verifyGoogleToken(token);
    } catch (verifyError) {
      console.error('Token verification error:', verifyError);
      return res.status(401).json({
        error: 'Authentication failed',
        details: 'Invalid Google token',
        verifyError: verifyError.message
      });
    }

    if (!googleProfile) {
      return res.status(401).json({
        error: 'Authentication failed',
        details: 'Unable to retrieve Google profile'
      });
    }

    try {
      const user = await GoogleAuthService.findOrCreateUser(googleProfile);

      const accessToken = GoogleAuthService.generateAccessToken(user);

      return res.status(200).json({
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role
        }
      });
    } catch (userError) {
      return res.status(500).json({
        error: 'User registration failed',
        details: userError.message || 'Unable to create or find user',
        profile: googleProfile
      });
    }

  } catch (error) {
    return res.status(500).json({
      error: 'Authentication process failed',
      details: error.message || 'Unexpected error during authentication'
    });
  }
};

export const handleGoogleUser = async (googleProfile) => {
  try {
    if (!googleProfile || !googleProfile.email) {
      console.error('Invalid Google profile:', googleProfile);
      throw new Error('Invalid Google profile');
    }

    const user = await GoogleAuthService.findOrCreateUser(googleProfile);
    const accessToken = GoogleAuthService.generateAccessToken(user);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role
      }
    };
  } catch (error) {
    console.error('Google user handling error:', {
      message: error.message,
      stack: error.stack,
      profile: googleProfile
    });
    throw new Error('Failed to process Google user');
  }
};
