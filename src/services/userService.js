import User from '../models/User.js';

export const getAllUsers = async () => {
  return await User.findAll(); // Fetch all users
};

export const getUserById = async (id) => {
  return await User.findByPk(id); // Fetch user by ID
};
