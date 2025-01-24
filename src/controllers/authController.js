import { registerUser, loginUser } from "../services/authService.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/jwtUtils.js";

export const register = async (req, res) => {
  try {
    const user = await registerUser(req.body);
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    res.status(201).json({ access_token: accessToken, refresh_token: refreshToken });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const user = await loginUser(req.body);
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    res
      .status(200)
      .json({ access_token: accessToken, refresh_token: refreshToken });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};
