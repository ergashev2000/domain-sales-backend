import * as UserService from '../services/userService.js';

export const createUser = async (req, res) => {
  try {
    // Validate request body
    const { 
      first_name, 
      last_name, 
      email, 
      password, 
      phone_number,
      role,
      is_verified,
      auth_type,
      avatar_url,
      google_id
    } = req.body;

    console.log("--------------", first_name);
    
    // Ensure email is provided
    if (!email) {
      return res.status(400).json({ 
        error: 'User creation failed', 
        message: 'Email is required' 
      });
    }

    // Prepare user data
    const userData = {
      first_name: first_name || null,
      last_name: last_name || null,
      email: email.trim().toLowerCase(),
      password: password || null,
      phone_number: phone_number || null,
      role: role || 'user',
      is_verified: is_verified || false,
      auth_type: auth_type || 'local',
      avatar_url: avatar_url || null,
      google_id: google_id || null
    };

    // Create user
    const newUser = await UserService.createUser(userData);

    // Respond with created user
    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: newUser.id,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        email: newUser.email,
        role: newUser.role,
        is_verified: newUser.is_verified,
        created_at: newUser.created_at
      }
    });
  } catch (error) {
    console.error('User creation error:', error);

    // Handle specific error cases
    if (error.message.includes('already exists')) {
      return res.status(409).json({ 
        error: 'User creation failed', 
        message: 'User with this email already exists' 
      });
    }

    // Generic error response
    res.status(500).json({ 
      error: 'User creation failed', 
      message: error.message 
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await UserService.getUserById(userId);
    
    res.json({
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
        is_verified: user.is_verified,
        avatar_url: user.avatar_url
      }
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(404).json({ 
      error: 'User not found', 
      message: error.message 
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const updateData = {
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email,
      password: req.body.password,
      avatar_url: req.body.avatar_url,
      phone_number: req.body.phone_number,
      is_verified: req.body.is_verified,
      role: req.body.role
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => 
      updateData[key] === undefined && delete updateData[key]
    );

    const updatedUser = await UserService.updateUser(userId, updateData);
    
    res.json({
      message: 'User updated successfully',
      user: {
        id: updatedUser.id,
        first_name: updatedUser.first_name,
        last_name: updatedUser.last_name,
        email: updatedUser.email,
        role: updatedUser.role
      }
    });
  } catch (error) {
    console.error('User update error:', error);
    res.status(500).json({ 
      error: 'User update failed', 
      message: error.message 
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    await UserService.deleteUser(userId);
    
    res.json({
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('User deletion error:', error);
    res.status(500).json({ 
      error: 'User deletion failed', 
      message: error.message 
    });
  }
};

export const listUsers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      role, 
      is_verified,
      sort_by = 'created_at',
      order = 'DESC'
    } = req.query;

    const filters = {
      page: parseInt(page),
      limit: parseInt(limit),
      role,
      is_verified: is_verified === 'true' ? true : is_verified === 'false' ? false : undefined,
      sort_by,
      order
    };

    const result = await UserService.listUsers(filters);
    console.log(result);
      
    res.json({
      users: result.users.map(user => ({
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
        is_verified: user.is_verified,
        created_at: user.created_at
      })),
      total: result.total,
      page: result.page,
      limit: result.limit
    });
  } catch (error) {
    console.error('List users error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve users', 
      message: error.message 
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { user, token } = await UserService.authenticateUser(email, password);
    
    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ 
      error: 'Authentication failed', 
      message: error.message 
    });
  }
};
