import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET;

if (!SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}

export function signToken(payload: object) {
  return jwt.sign(payload, SECRET as string, { expiresIn: "2h" });
}

export function verifyToken(token: string) {
  return jwt.verify(token, SECRET as string);
}
