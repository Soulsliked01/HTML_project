/**
 * Authentication controller using fake tokens
 */

import { Request, Response, Router, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import { UsersService } from "../services/users.service";
import { isString } from "../utils/guards";
import { validateFakeToken } from "../utils/token.utils";
import { AuthenticatedRequest } from "../models/auth.model";

export const authController = Router();

/**
 * POST /auth/login
 * Public: returns a fake token if credentials are valid
 */
authController.post("/login", async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!isString(username) || !isString(password)) {
    return res.status(400).send("Missing username or password");
  }

  const result = await AuthService.login(username, password); // ← await

  if (!result) {
    return res.status(401).send("Invalid credentials");
  }

  return res.status(200).json(result);
});
/**
 * Middleware: authorize
 * Any authenticated user
 */
export function authorize(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization;

  if (!isString(token)) {
    return res.status(401).send("Missing or invalid token");
  }

  const username = validateFakeToken(token);

  if (!username) {
    return res.status(401).send("Invalid token");
  }

  const user = UsersService.getByUsername(username);

  if (!user) {
    return res.status(401).send("User not found");
  }

  req.user = user;
  next();
}

/**
 * Middleware: isAdmin
 * Only admin users
 */
export function isAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(403).json({ error: "Forbidden: user not authenticated" });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden: admin role required" });
  }

  next();
}

/**
 * Middleware: isAdminOrReferee
 * Admin OR referee users
 */
export function isAdminOrReferee(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(403).json({ error: "Forbidden: user not authenticated" });
  }

  if (req.user.role !== "admin" && req.user.role !== "referee") {
    return res.status(403).json({ error: "Forbidden: admin or referee role required" });
  }

  next();
}

/**
 * Middleware: isSelfOrAdmin
 * A user can modify/delete themselves OR admin can do anything
 */
export function isSelfOrAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(403).json({ error: "Forbidden: user not authenticated" });
  }

  const targetId = Number(req.params.id);

  // Admin can do anything
  if (req.user.role === "admin") {
    return next();
  }

  // User can only modify themselves
  if (req.user.id === targetId) {
    return next();
  }

  return res.status(403).json({ error: "Forbidden: cannot modify another user" });
}
