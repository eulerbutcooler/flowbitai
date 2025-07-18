import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: string;
    customerId: string;
    email?: string;
  };
}

const SECRET = process.env.JWT_SECRET;

if (!SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}

export function authenticateJWT(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Missing token" });

  const token = authHeader.split(" ")[1];
  try {
    const user = jwt.verify(token, SECRET as string) as AuthenticatedRequest["user"];
    req.user = user;
    next();
  } catch {
    return res.status(403).json({ error: "Invalid token" });
  }
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const user = req.user;
  if (!user || user.role !== "ADMIN")
    return res.status(403).json({ message: "Admins only" });
  next();
}
