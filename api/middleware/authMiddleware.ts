import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "supersecret";

export function authenticateJWT(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Missing token" });

  const token = authHeader.split(" ")[1];
  try {
    const user = jwt.verify(token, SECRET);
    (req as any).user = user;
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid token" });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;
  if (user.role !== "Admin")
    return res.status(403).json({ message: "Admins only" });
  next();
}
