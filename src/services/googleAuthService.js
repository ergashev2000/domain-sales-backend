import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from '../environments/auth_env.js';

class GoogleAuthService {
  constructor() {
    this.client = new OAuth2Client(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      'postmessage'
    );
  }

  async verifyGoogleToken(token) {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken: token,
        audience: GOOGLE_CLIENT_ID
      });

      const payload = ticket.getPayload();
      return {
        email: payload['email'],
        firstName: payload['given_name'],
        lastName: payload['family_name'],
        avatarUrl: payload['picture'],
        googleId: payload['sub']
      };
    } catch (error) {
      console.error('Google token verification failed:', error);
      throw new Error('Invalid Google token');
    }
  }

  async findOrCreateUser(googleProfile) {
    try {
      // Find existing user by Google ID or email
      let user = await User.findOne({
        where: {
          [User.sequelize.Op.or]: [
            { google_id: googleProfile.googleId },
            { email: googleProfile.email }
          ]
        }
      });

      // If user doesn't exist, create a new one
      if (!user) {
        user = await User.create({
          email: googleProfile.email,
          first_name: googleProfile.firstName,
          last_name: googleProfile.lastName,
          google_id: googleProfile.googleId,
          avatar_url: googleProfile.avatarUrl,
          auth_type: 'google',
          is_verified: true,
          last_enter_date: new Date()
        });
      } else {
        // Update existing user's Google details if needed
        await user.update({
          google_id: googleProfile.googleId || user.google_id,
          avatar_url: googleProfile.avatarUrl || user.avatar_url,
          last_enter_date: new Date()
        });
      }

      return user;
    } catch (error) {
      console.error('User creation/update error:', error);
      throw new Error('Failed to process Google authentication');
    }
  }

  generateAccessToken(user) {
    return jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        role: user.role 
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );
  }
}

export default new GoogleAuthService();
