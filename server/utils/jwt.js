import jwt from "jsonwebtoken";
import env from "../config/env.js";

const signToken = (payload, secret, expiresIn) => {
  return jwt.sign(payload, secret, {
    expiresIn,
    algorithm: "HS256",
  });
};

const verifyToken = (token, secret) => {
  return jwt.verify(token, secret, {
    algorithms: ["HS256"],
  });
};

export const generateAccessToken = (payload) =>
  signToken(
    payload,
    env.JWT_ACCESS_SECRET,
    env.ACCESS_TOKEN_EXPIRES
  );

export const generateRefreshToken = (payload) =>
  signToken(
    payload,
    env.JWT_REFRESH_SECRET,
    env.REFRESH_TOKEN_EXPIRES
  );

export const verifyAccessToken = (token) =>
  verifyToken(token, env.JWT_ACCESS_SECRET);

export const verifyRefreshToken = (token) =>
  verifyToken(token, env.JWT_REFRESH_SECRET);