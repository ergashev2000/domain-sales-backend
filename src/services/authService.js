import bcrypt from 'bcrypt';
import User from '../models/User.js';

export const registerUser = async (userData) => {
  const hashedPassword = await bcrypt.hash(userData.password, 10);
  const user = await User.create({
    first_name: userData.first_name,
    last_name: userData.last_name,
    email: userData.email,
    password: hashedPassword,
    last_enter_date: new Date(),
    created_at: new Date(),
    phone_number: userData.phone_number || null,
  });
  return user;
};

export const loginUser = async (credentials) => {
  const user = await User.findOne({ where: { email: credentials.email } });
  if (!user || !(await bcrypt.compare(credentials.password, user.password))) {
    throw new Error('Invalid credentials');
  }
  return user;
};