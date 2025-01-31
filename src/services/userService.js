import * as User from '../models/User.js';

export const createUser = async (userData) => {
  try {
    // Validate required fields
    if (!userData.email) {
      throw new Error('Email is required');
    }

    // Additional validation can be added here
    if (userData.password && userData.password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    // Sanitize and prepare user data
    const sanitizedUserData = {
      first_name: userData.first_name ? String(userData.first_name).trim() : null,
      last_name: userData.last_name ? String(userData.last_name).trim() : null,
      email: String(userData.email).trim().toLowerCase(),
      password: userData.password ? await bcrypt.hash(String(userData.password), 10) : null,
      phone_number: userData.phone_number ? String(userData.phone_number).trim() : null,
      role: userData.role || 'user',
      is_verified: userData.is_verified || false,
      auth_type: userData.auth_type || 'local',
      avatar_url: userData.avatar_url || null,
      google_id: userData.google_id || null
    };

    // Create user
    return await User.createUser(sanitizedUserData);
  } catch (error) {
    console.error('User creation service error:', error);
    throw error;
  }
};

export const getUserById = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  } catch (error) {
    console.error('Get user by ID error:', error);
    throw error;
  }
};

export const getUserByEmail = async (email) => {
  try {
    const user = await User.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  } catch (error) {
    console.error('Get user by email error:', error);
    throw error;
  }
};

export const updateUser = async (userId, updateData) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return await User.updateUser(userId, updateData);
  } catch (error) {
    console.error('User update error:', error);
    throw error;
  }
};

export const deleteUser = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return await User.deleteUser(userId);
  } catch (error) {
    console.error('User deletion error:', error);
    throw error;
  }
};

export const listUsers = async (filters) => {
  try {
    // Ensure all filters are properly converted to the right type
    const processedFilters = {
      page: parseInt(filters.page) || 1,
      limit: parseInt(filters.limit) || 20,
      role: filters.role,
      is_verified: filters.is_verified !== undefined 
        ? (filters.is_verified === 'true' ? true : 
           filters.is_verified === 'false' ? false : undefined)
        : undefined,
      sort_by: filters.sort_by || 'created_at',
      order: filters.order || 'DESC'
    };

    return await User.listUsers(processedFilters);
  } catch (error) {
    console.error('List users service error:', error);
    throw error;
  }
};

export const authenticateUser = async (email, password) => {
  try {
    const user = await User.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isPasswordValid = await User.validatePassword(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    const token = User.generateToken(user);
    return { user, token };
  } catch (error) {
    console.error('User authentication error:', error);
    throw error;
  }
};
