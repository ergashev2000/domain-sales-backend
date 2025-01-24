import { getAllUsers, getUserById } from '../services/userService.js';

export const getUsers = async (req, res) => {
  try {
    const users = await getAllUsers();
    res.status(200).json(users); // Return all users
  } catch (error) {
    res.status(500).json({ error: error.message }); // Handle errors
  }
};

export const getUser = async (req, res) => {
  const { id } = req.params; // Get user ID from request parameters
  try {
    const user = await getUserById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' }); // Handle user not found
    }
    res.status(200).json(user); // Return user data
  } catch (error) {
    res.status(500).json({ error: error.message }); // Handle errors
  }
};
