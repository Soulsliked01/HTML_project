import { Request } from "express";
import { ERole, User } from "./user.model";

export interface AuthentificatedUserDTO {
    username: string;
    token:    string;
    role:     ERole;
}

/**
 * Extended Express Request carrying the authenticated user.
 * Populated by the `authorize` middleware in auth.controller.ts.
 */
export interface AuthenticatedRequest extends Request {
    user?: User;
}