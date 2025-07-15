import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "supersecret";

export function signToken(payload: object) {
  return jwt.sign(payload, SECRET, { expiresIn: "2h" });
}

export function verifyToken(token: string) {
  return jwt.verify(token, SECRET);
}
