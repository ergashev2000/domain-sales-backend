import jwt from "jsonwebtoken";
import {
  ACCESS_SECRET_KEY,
  REFRESH_SECRET_KEY,
} from "../environments/auth_env.js";

export const generateAccessToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
  };
  return jwt.sign(payload, ACCESS_SECRET_KEY, { expiresIn: "1h" });
};

export const generateRefreshToken = (user) => {
  const payload = {
    id: user.id,
  };
  return jwt.sign(payload, REFRESH_SECRET_KEY, { expiresIn: "7d" });
};

export const verifyAccessToken = (token) => {
  return jwt.verify(token, ACCESS_SECRET_KEY);
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, REFRESH_SECRET_KEY);
};
