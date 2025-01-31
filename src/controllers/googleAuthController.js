import GoogleAuthService from '../services/googleAuthService.js';

export const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return {
        status: 400,
        data: {
          error: 'Authentication failed',
          details: 'Google token is required'
        }
      };
    }

    let googleProfile;
    try {
      googleProfile = await GoogleAuthService.verifyGoogleToken(token);
    } catch (verifyError) {
      console.error('Token verification error:', verifyError);
      return {
        status: 401,
        data: {
          error: 'Authentication failed',
          details: 'Invalid Google token',
          verifyError: verifyError.message
        }
      };
    }

    if (!googleProfile) {
      return {
        status: 401,
        data: {
          error: 'Authentication failed',
          details: 'Unable to retrieve Google profile'
        }
      };
    }

    // Find or create user based on Google profile
    const user = await GoogleAuthService.findOrCreateUser(googleProfile);

    if (!user) {
      return {
        status: 500,
        data: {
          error: 'Authentication failed',
          details: 'Unable to create or find user'
        }
      };
    }

    // Generate access token for the user
    const accessToken = GoogleAuthService.generateAccessToken(user);

    return {
      status: 200,
      data: {
        message: 'Authentication successful',
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          avatarUrl: user.avatar_url
        }
      }
    };
  } catch (error) {
    console.error('Google login error:', error);
    return {
      status: 500,
      data: { 
        error: 'Authentication failed', 
        details: error.message 
      }
    };
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
