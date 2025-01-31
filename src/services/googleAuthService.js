import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { 
  GOOGLE_CLIENT_ID, 
  GOOGLE_CLIENT_SECRET,
  ACCESS_SECRET_KEY 
} from '../environments/auth_env.js';
import { executeQuery } from '../config/db.js';

class GoogleAuthService {
  constructor() {
    this.client = new OAuth2Client(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET
    );
  }

  static async verifyGoogleToken(token) {
    try {
      console.log('Verifying Google Token:', { 
        clientId: GOOGLE_CLIENT_ID,
        tokenLength: token ? token.length : 'No token'
      });

      const client = new OAuth2Client(GOOGLE_CLIENT_ID);
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: GOOGLE_CLIENT_ID
      });

      const payload = ticket.getPayload();
      
      console.log('Google Token Payload:', {
        email: payload['email'],
        sub: payload['sub']
      });

      return {
        googleId: payload['sub'],
        email: payload['email'],
        firstName: payload['given_name'] || '',
        lastName: payload['family_name'] || '',
        avatarUrl: payload['picture'] || ''
      };
    } catch (error) {
      console.error('Google token verification failed:', {
        message: error.message,
        stack: error.stack
      });
      return null;
    }
  }

  static async findOrCreateUser(googleProfile) {
    console.log('Finding or Creating User:', { 
      email: googleProfile.email,
      googleId: googleProfile.googleId 
    });

    try {
      const { email, firstName, lastName, avatarUrl, googleId } = googleProfile;

      if (!email) {
        console.error('Email is required', { profile: googleProfile });
        throw new Error('Email is required');
      }

      // First, check if user exists
      const existingUserQuery = {
        text: 'SELECT * FROM users WHERE email = $1',
        values: [email]
      };
      const existingUserResult = await executeQuery(existingUserQuery);

      // If user exists, update their information
      if (existingUserResult.rows.length > 0) {
        const updateQuery = {
          text: `
            UPDATE users 
            SET 
              first_name = COALESCE($1, first_name),
              last_name = COALESCE($2, last_name),
              avatar_url = COALESCE($3, avatar_url),
              google_id = COALESCE($4, google_id),
              last_enter_date = NOW(),
              is_verified = true
            WHERE email = $5
            RETURNING *
          `,
          values: [
            firstName || null,
            lastName || null,
            avatarUrl || null,
            googleId || null,
            email
          ]
        };
        const updateResult = await executeQuery(updateQuery);
        return updateResult.rows[0];
      }

      // If user doesn't exist, create new user
      const createUserQuery = {
        text: `
          INSERT INTO users (
            email, 
            first_name, 
            last_name, 
            avatar_url, 
            google_id, 
            role, 
            is_verified, 
            auth_type, 
            created_at,
            last_enter_date
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()
          ) RETURNING *
        `,
        values: [
          email,
          firstName || null,
          lastName || null,
          avatarUrl || null,
          googleId || null,
          'user',
          true,
          'google'
        ]
      };
      
      const createResult = await executeQuery(createUserQuery);
      return createResult.rows[0];
    } catch (error) {
      console.error('User find or create error:', {
        message: error.message,
        stack: error.stack,
        profile: googleProfile
      });
      
      // Handle unique constraint violations
      if (error.code === '23505') {
        throw new Error('User with this email already exists');
      }
      
      throw new Error('Failed to process Google user');
    }
  }

  static generateAccessToken(user) {
    try {
      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email, 
          role: user.role 
        }, 
        ACCESS_SECRET_KEY, 
        { expiresIn: '1d' }
      );

      console.log('Access Token Generated:', { 
        userId: user.id, 
        email: user.email 
      });

      return token;
    } catch (error) {
      console.error('Token generation error:', {
        message: error.message,
        stack: error.stack,
        userId: user.id
      });
      throw new Error('Failed to generate access token');
    }
  }
}

export default GoogleAuthService;
