import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/config.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

class User extends Model {
  // Method to validate password
  async validatePassword(password) {
    return bcrypt.compare(password, this.password);
  }

  // Method to hash password before saving
  async hashPassword(password) {
    return bcrypt.hash(password, 10);
  }

  // Method to generate a secure token
  generateToken() {
    // Implement token generation logic
    return jwt.sign(
      { 
        id: this.id, 
        email: this.email 
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );
  }
}

User.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  first_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  last_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  google_id: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  avatar_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  last_enter_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  phone_number: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  auth_type: {
    type: DataTypes.ENUM('local', 'google', 'facebook'),
    defaultValue: 'local'
  },
  role: {
    type: DataTypes.ENUM('user', 'admin', 'moderator'),
    defaultValue: 'user'
  }
}, { 
  sequelize, 
  modelName: 'User',
  hooks: {
    beforeCreate: async (user) => {
      // Hash password if local auth
      if (user.password && user.auth_type === 'local') {
        user.password = await bcrypt.hash(user.password, 10);
      }
    },
    beforeUpdate: async (user) => {
      // Hash password if changed and local auth
      if (user.changed('password') && user.auth_type === 'local') {
        user.password = await bcrypt.hash(user.password, 10);
      }
    }
  }
});

export default User;