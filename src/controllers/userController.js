const { Op } = require('sequelize');
const User = require('../models/User');
const Domain = require('../models/Domain');
const logger = require('../utils/logger');
const { generateToken } = require('../middleware/auth');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.registerUser = async (req, res) => {
  try {
    const { 
      first_name, 
      last_name, 
      email, 
      password, 
      phone_number 
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      where: { 
        [Op.or]: [{ email }] 
      } 
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const user = await User.create({
      first_name,
      last_name,
      email,
      password,
      phone_number,
      auth_type: 'local'
    });

    const token = generateToken(user);

    res.status(201).json({
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone_number: user.phone_number
      },
      token
    });
  } catch (error) {
    logger.error('User registration error:', error);
    res.status(400).json({ error: error.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: 'Invalid login credentials' });
    }

    // Check for local auth
    if (user.auth_type === 'local') {
      const isMatch = await user.comparePassword(password);

      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid login credentials' });
      }
    }

    const token = generateToken(user);

    res.json({
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone_number: user.phone_number,
        role: user.role
      },
      token
    });
  } catch (error) {
    logger.error('User login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
};

exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { 
      sub: google_id, 
      email, 
      given_name: first_name, 
      family_name: last_name 
    } = payload;

    // Find or create user
    let user = await User.findOne({ 
      where: { 
        [Op.or]: [
          { google_id },
          { email }
        ] 
      } 
    });

    if (!user) {
      // Create new user with Google credentials
      user = await User.create({
        first_name,
        last_name,
        email,
        google_id,
        auth_type: 'google'
      });
    } else if (!user.google_id) {
      // Update existing user with Google ID if not already set
      await user.update({ 
        google_id,
        auth_type: 'google',
        first_name: first_name || user.first_name,
        last_name: last_name || user.last_name
      });
    }

    const authToken = generateToken(user);

    res.json({
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role
      },
      token: authToken
    });
  } catch (error) {
    logger.error('Google login error:', error);
    res.status(400).json({ error: 'Google authentication failed' });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { 
        exclude: ['password', 'google_id'] 
      },
      include: [{
        model: Domain,
        as: 'domains',
        attributes: ['id', 'name', 'price', 'status']
      }]
    });

    res.json(user);
  } catch (error) {
    logger.error('Get user profile error:', error);
    res.status(500).json({ error: 'Server error retrieving profile' });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const { first_name, last_name, phone_number } = req.body;

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.update({ 
      first_name, 
      last_name, 
      phone_number 
    });

    res.json({
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone_number: user.phone_number
    });
  } catch (error) {
    logger.error('Update user profile error:', error);
    res.status(400).json({ error: error.message });
  }
};
