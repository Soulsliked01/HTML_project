import { AuthentificatedUserDTO } from "../models/auth.model";
import { UsersService } from "./users.service";
import { generateFakeToken } from "../utils/token.utils";
import bcrypt from "bcrypt";

export class AuthService {
    public static async login(username: string, password: string): Promise<AuthentificatedUserDTO | null> {
        const user = UsersService.getByUsername(username);
        if (!user) return null;
        if (user.status === "inactive") return null;

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        return {
            username: user.username,
            token: generateFakeToken(user.username),
            role: user.role
        };
    }
}