import jwt from 'jsonwebtoken';
import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { SECRET_KEY } from '../environments/auth_env.js';
import * as User from '../models/User.js';

// JWT Strategy Configuration
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: SECRET_KEY
};

// JWT Strategy for Passport
passport.use(new JwtStrategy(jwtOptions, async (jwt_payload, done) => {
  try {
    const user = await User.findById(jwt_payload.id);
    
    if (user) {
      return done(null, user);
    } else {
      return done(null, false);
    }
  } catch (error) {
    return done(error, false);
  }
}));

// Serialize user for session - store only the user ID
passport.serializeUser((user, done) => {
  // Ensure we're using a unique, stable identifier
  done(null, {
    id: user.id,
    email: user.email
  });
});

// Deserialize user from session - reconstruct user object
passport.deserializeUser(async (userData, done) => {
  try {
    // Retrieve full user details using the stored ID
    const user = await User.findById(userData.id);
    
    if (user) {
      // Remove sensitive information before returning
      const { password, ...safeUser } = user;
      done(null, safeUser);
    } else {
      done(new Error('User not found'));
    }
  } catch (error) {
    done(error);
  }
});

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (token == null) {
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    
    req.user = user;
    next();
  });
};

export default passport;