import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { executeQuery } from '../config/db.js';

export const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

export const validatePassword = async (inputPassword, hashedPassword) => {
  return await bcrypt.compare(inputPassword, hashedPassword);
};

export const generateToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role
  };

  return jwt.sign(payload, process.env.JWT_SECRET || 'default_secret', {
    expiresIn: '24h'
  });
};

export const createUser = async (userData) => {
  try {
    // Validate required fields with comprehensive checks
    if (!userData) {
      throw new Error('User data is required');
    }

    if (!userData.email) {
      throw new Error('Email is required');
    }

    // Comprehensive logging of input data
    console.log('Raw User Data:', JSON.stringify(userData, null, 2));

    // Prepare values with explicit null handling and type conversion
    const values = [
      userData.first_name ? String(userData.first_name).trim() : null,
      userData.last_name ? String(userData.last_name).trim() : null,
      String(userData.email).trim().toLowerCase(),
      userData.password ? await bcrypt.hash(String(userData.password), 10) : null,
      userData.phone_number ? String(userData.phone_number).trim() : null,
      userData.role ? String(userData.role).trim() : 'user',
      userData.is_verified !== undefined ? Boolean(userData.is_verified) : false,
      userData.auth_type ? String(userData.auth_type).trim() : 'local',
      userData.avatar_url ? String(userData.avatar_url).trim() : null,
      userData.google_id ? String(userData.google_id).trim() : null
    ];

    // Validate values before query
    const validatedValues = values.map((val, index) => {
      console.log(`Parameter ${index + 1}: ${val} (${typeof val})`);
      return val;
    });

    // Prepare query with explicit parameters
    const query = {
      text: `
        INSERT INTO users (
          first_name, 
          last_name, 
          email, 
          password, 
          phone_number, 
          role, 
          is_verified, 
          auth_type, 
          avatar_url, 
          google_id,
          created_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW()
        ) RETURNING 
          id, 
          first_name, 
          last_name, 
          email, 
          role, 
          is_verified, 
          created_at
      `,
      values: validatedValues
    };

    // Extensive logging of query
    console.log('Create User Query:', {
      text: query.text,
      values: query.values,
      valueTypes: query.values.map(v => typeof v)
    });

    // Execute query
    const result = await executeQuery(query);

    // Validate result
    if (!result || !result.rows || result.rows.length === 0) {
      throw new Error('User creation failed: No result returned');
    }

    return result.rows[0];
  } catch (error) {
    // Comprehensive error logging
    console.error('User Creation Error:', {
      message: error.message,
      name: error.name,
      code: error.code,
      stack: error.stack,
      userData: JSON.stringify(userData, null, 2)
    });
    
    // Handle specific error cases
    if (error.code === '23505') {
      throw new Error('User with this email already exists');
    }

    throw error;
  }
};

export const findById = async (userId) => {
  try {
    const getUserQuery = {
      text: 'SELECT * FROM users WHERE id = $1',
      values: [userId]
    };

    const result = await executeQuery(getUserQuery);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Find user by ID error:', error);
    throw error;
  }
};

export const findByEmail = async (email) => {
  try {
    const getUserQuery = {
      text: 'SELECT * FROM users WHERE email = $1',
      values: [email]
    };

    const result = await executeQuery(getUserQuery);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Find user by email error:', error);
    throw error;
  }
};

export const updateUser = async (userId, updateData) => {
  try {
    const { 
      first_name, 
      last_name, 
      email, 
      password, 
      avatar_url, 
      phone_number, 
      is_verified,
      role 
    } = updateData;

    const updateFields = [];
    const values = [];
    let paramCount = 1;

    if (first_name) {
      updateFields.push(`first_name = $${paramCount}`);
      values.push(first_name);
      paramCount++;
    }
    if (last_name) {
      updateFields.push(`last_name = $${paramCount}`);
      values.push(last_name);
      paramCount++;
    }
    if (email) {
      updateFields.push(`email = $${paramCount}`);
      values.push(email);
      paramCount++;
    }
    if (password) {
      const hashedPassword = await hashPassword(password);
      updateFields.push(`password = $${paramCount}`);
      values.push(hashedPassword);
      paramCount++;
    }
    if (avatar_url) {
      updateFields.push(`avatar_url = $${paramCount}`);
      values.push(avatar_url);
      paramCount++;
    }
    if (phone_number) {
      updateFields.push(`phone_number = $${paramCount}`);
      values.push(phone_number);
      paramCount++;
    }
    if (is_verified !== undefined) {
      updateFields.push(`is_verified = $${paramCount}`);
      values.push(is_verified);
      paramCount++;
    }
    if (role) {
      updateFields.push(`role = $${paramCount}`);
      values.push(role);
      paramCount++;
    }

    values.push(userId);

    const updateUserQuery = {
      text: `
        UPDATE users 
        SET ${updateFields.join(', ')} 
        WHERE id = $${paramCount} 
        RETURNING *
      `,
      values
    };

    const result = await executeQuery(updateUserQuery);
    return result.rows[0];
  } catch (error) {
    console.error('User update error:', error);
    throw error;
  }
};

export const deleteUser = async (userId) => {
  try {
    const deleteUserQuery = {
      text: 'DELETE FROM users WHERE id = $1',
      values: [userId]
    };

    await executeQuery(deleteUserQuery);
    return true;
  } catch (error) {
    console.error('User deletion error:', error);
    throw error;
  }
};

export const listUsers = async (filters = {}) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      role, 
      is_verified,
      sort_by = 'created_at',
      order = 'DESC'
    } = filters;

    // Calculate offset
    const offset = (page - 1) * limit;

    // Build where clauses and values dynamically
    const whereClauses = [];
    const values = [];
    let paramCount = 1;

    if (role) {
      whereClauses.push(`role = $${paramCount}`);
      values.push(role);
      paramCount++;
    }

    if (is_verified !== undefined) {
      whereClauses.push(`is_verified = $${paramCount}`);
      values.push(is_verified);
      paramCount++;
    }

    const whereClause = whereClauses.length > 0 
      ? `WHERE ${whereClauses.join(' AND ')}` 
      : '';

    // Construct count query
    const countQuery = {
      text: `SELECT COUNT(*) FROM users ${whereClause}`,
      values
    };

    // Construct list query
    const listQuery = {
      text: `
        SELECT 
          *
        FROM users 
      `,
      values: [
        ...values, 
        limit, 
        offset
      ]
    };

    // Execute both queries
    const [countResult, listResult] = await Promise.all([
      executeQuery(countQuery),
      executeQuery(listQuery)
    ]);

    console.log("-----------------------------",listQuery.values, listResult.rows);
    
    // Safely handle count result
    const total = countResult && countResult.rows && countResult.rows[0] 
      ? parseInt(countResult.rows[0].count) 
      : 0;

    return {
      users: listResult.rows || [],
      total,
      page: parseInt(page),
      limit: parseInt(limit)
    };
  } catch (error) {
    console.error('List users error:', error);
    throw error;
  }
};

export default {
  createUser,
  findById,
  findByEmail,
  updateUser,
  deleteUser,
  listUsers,
  hashPassword,
  validatePassword,
  generateToken
};
