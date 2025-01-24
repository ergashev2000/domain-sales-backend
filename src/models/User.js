import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/config.js';

class User extends Model {}

User.init({
  first_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  last_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  last_enter_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  phone_number: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, { sequelize, modelName: 'User' });

export default User;