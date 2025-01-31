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
      });

      // Construct complete profile object
      const googleProfile = {
        googleId: payload['sub'],
        email: payload['email'],
        firstName: payload['given_name'] || '',
        lastName: payload['family_name'] || '',
        avatarUrl: payload['picture'] || ''
      };

      return googleProfile;
    } catch (error) {
      console.error('Token verification error:', error);
      throw error;
    }
  }

  static async findOrCreateUser(googleProfile) {
    console.log('Finding or Creating User:', { 
      email: googleProfile.email,
      googleId: googleProfile.googleId,
      firstName: googleProfile.firstName,
      lastName: googleProfile.lastName,
      avatarUrl: googleProfile.avatarUrl
    });

    try {
      const { email, firstName, lastName, avatarUrl, googleId } = googleProfile;

      if (!email) {
        console.error('Email is required', { profile: googleProfile });
        throw new Error('Email is required for user creation');
      }

      // Validate required fields
      if (!firstName) {
        console.warn('First name is missing, using a default');
      }

      // First, check if user exists
      const existingUserQuery = {
        text: 'SELECT * FROM users WHERE email = $1',
        values: [email]
      };
      
      let existingUserResult;
      try {
        existingUserResult = await executeQuery(existingUserQuery.text, existingUserQuery.values);
      } catch (queryError) {
        console.error('Error checking existing user:', {
          message: queryError.message,
          code: queryError.code,
          stack: queryError.stack
        });
        throw new Error(`Database query error: ${queryError.message}`);
      }

      // If user exists, update their information
      if (existingUserResult.length > 0) {
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
            RETURNING id, email, first_name, last_name, avatar_url, role
          `,
          values: [
            firstName || null,
            lastName || null,
            avatarUrl || null,
            googleId || null,
            email
          ]
        };
        
        try {
          const updateResult = await executeQuery(updateQuery.text, updateQuery.values);
          return updateResult[0];
        } catch (updateError) {
          console.error('Error updating existing user:', {
            message: updateError.message,
            code: updateError.code,
            stack: updateError.stack
          });
          throw new Error(`Failed to update existing user: ${updateError.message}`);
        }
      }

      // If user doesn't exist, create new user
      const createUserQuery = {
        text: `
          WITH new_user AS (
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
            )
            RETURNING id, email, first_name, last_name, avatar_url, role
          )
          SELECT * FROM new_user
        `,
        values: [
          email,
          firstName || 'Google User',  // Provide a default first name
          lastName || '',
          avatarUrl || null,
          googleId || null,
          'user',
          true,
          'google'
        ]
      };
      
      console.log('Creating new user with query:', {
        email,
        firstName: firstName || 'Google User',
        lastName: lastName || '',
        avatarUrl,
        googleId
      });

      try {
        const createResult = await executeQuery(createUserQuery.text, createUserQuery.values);
        
        if (createResult.length === 0) {
          console.error('No user created', { query: createUserQuery });
          throw new Error('Failed to create user: No result returned');
        }

        console.log('User created successfully:', createResult[0]);
        return createResult[0];
      } catch (createError) {
        console.error('Error creating new user:', {
          message: createError.message,
          code: createError.code,
          stack: createError.stack
        });
        throw new Error(`Failed to create new user: ${createError.message}`);
      }
    } catch (error) {
      console.error('Comprehensive user find or create error:', {
        message: error.message,
        stack: error.stack,
        code: error.code,
        profile: googleProfile
      });
      
      // Handle unique constraint violations
      if (error.code === '23505') {
        throw new Error('User with this email already exists');
      }
      
      // Throw the original error for more context
      throw error;
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
