import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is required. Set it in the backend environment before starting the server.");
}

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    username: string;
  };
}

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : undefined;

  if (!token) {
    res.status(401).json({
      success: false,
      message: "Access token required. Please log in."
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
      username: string;
    };
    req.user = decoded;
    next();
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      res.status(401).json({
        success: false,
        message: "Your session has expired. Please log in again."
      });
      return;
    }
    res.status(403).json({
      success: false,
      message: "Invalid or corrupted authentication token."
    });
  }
};

export const generateToken = (payload: { userId: string; email: string; username: string }) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
};
