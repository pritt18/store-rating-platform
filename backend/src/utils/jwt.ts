import jwt from "zod";
import jwtLib from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "storerating_super_secure_jwt_secret_key_2026";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export interface JwtPayload {
  userId: number;
  email: string;
  role: string;
}

export const signToken = (payload: JwtPayload): string => {
  return jwtLib.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as jwtLib.SignOptions["expiresIn"],
  });
};

export const verifyToken = (token: string): JwtPayload => {
  return jwtLib.verify(token, JWT_SECRET) as JwtPayload;
};
