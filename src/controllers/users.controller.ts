import { Request, Response, Router } from "express";
import { UsersService } from "../services/users.service";
import { LoggerService } from "../services/logger.service";
import { UserDTO, NewUserDTO, ERole, User } from "../models/user.model";
import { UsersMapper } from "../mappers/users.mapper";
import { isNumber, isString, isUserDTO, isNewUserDTO, isUserRole } from "../utils/guards";
import { validateFakeToken } from "../utils/token.utils";

export const usersController = Router();

function getCaller(req: Request): User | null {
    const token = req.headers.authorization;
    if (!token || !isString(token)) return null;
    const username = validateFakeToken(token);
    if (!username) return null;
    return UsersService.getByUsername(username) ?? null;
}

// GET /users — AVANT /:id
usersController.get("/username/:username", (req: Request, res: Response) => {
    const caller = getCaller(req);
    if (!caller) return res.status(401).send("Missing or invalid token");
    if (caller.role !== "admin" && caller.role !== "referee") return res.status(403).send("Forbidden");
    const user = UsersService.getByUsername(req.params.username);
    if (!user) return res.status(404).send("User not found");
    return res.status(200).json(UsersMapper.toDTO(user));
});

usersController.get("/email/:email", (req: Request, res: Response) => {
    const caller = getCaller(req);
    if (!caller) return res.status(401).send("Missing or invalid token");
    if (caller.role !== "admin" && caller.role !== "referee") return res.status(403).send("Forbidden");
    const user = UsersService.getByEmail(req.params.email);
    if (!user) return res.status(404).send("User not found");
    return res.status(200).json(UsersMapper.toDTO(user));
});

usersController.get("/", (req: Request, res: Response) => {
    const caller = getCaller(req);
    if (!caller) return res.status(401).send("Missing or invalid token");
    const users = UsersService.getAll().filter(u => u.status === "active");
    if (caller.role === "admin") return res.status(200).json(users.map(u => UsersMapper.toDTO(u)));
    return res.status(200).json(users.map(u => UsersMapper.toShortDTO(u)));
});

usersController.get("/:id", (req: Request, res: Response) => {
    const caller = getCaller(req);
    if (!caller) return res.status(401).send("Missing or invalid token");
    const id = Number(req.params.id);
    if (!isNumber(id)) return res.status(400).send("Invalid id");
    const user = UsersService.getById(id);
    if (!user) return res.status(404).send("User not found");
    if (caller.role === "admin" || caller.id === id) return res.status(200).json(UsersMapper.toDTO(user));
    return res.status(200).json(UsersMapper.toShortDTO(user));
});

usersController.post("/", (req: Request, res: Response) => {
    const newUser: NewUserDTO = req.body;
    if (!isNewUserDTO(newUser)) return res.status(400).send("Missing or invalid fields");
    try {
        const created = UsersService.create(UsersMapper.fromNewDTO(newUser));
        return res.status(201).json(UsersMapper.toDTO(created!));
    } catch (err: any) {
        return res.status(400).send(err.message);
    }
});

usersController.put("/:id", (req: Request, res: Response) => {
    const caller = getCaller(req);
    if (!caller) return res.status(401).send("Missing or invalid token");
    const id = Number(req.params.id);
    if (!isNumber(id)) return res.status(400).send("Invalid id");
    const dto: UserDTO = req.body;
    if (!isUserDTO(dto)) return res.status(400).send("Missing or invalid fields");
    if (dto.id !== id) return res.status(400).send("Body id and path id do not match");
    if (caller.role !== "admin" && caller.id !== id) return res.status(403).send("Forbidden");
    const updated = UsersService.update(id, UsersMapper.fromDTO(dto));
    if (!updated) return res.status(404).send("User not found");
    return res.status(200).json(UsersMapper.toDTO(updated));
});

usersController.delete("/:id", (req: Request, res: Response) => {
    const caller = getCaller(req);
    if (!caller) return res.status(401).send("Missing or invalid token");
    const id = Number(req.params.id);
    if (!isNumber(id)) return res.status(400).send("Invalid id");
    if (caller.role !== "admin" && caller.id !== id) return res.status(403).send("Forbidden");
    const target = UsersService.getById(id);
    if (!target) return res.status(404).send("User not found");
    if (target.role === "admin") return res.status(400).send("Cannot delete an admin");
    UsersService.delete(id);
    return res.status(200).send();
});

usersController.patch("/:id/role/:role", (req: Request, res: Response) => {
    const caller = getCaller(req);
    if (!caller) return res.status(401).send("Missing or invalid token");
    if (caller.role !== "admin") return res.status(403).send("Forbidden");
    const id = Number(req.params.id);
    if (!isNumber(id)) return res.status(400).send("Invalid id");
    const role = req.params.role;
    if (!isUserRole(role)) return res.status(400).send("Invalid role");
    const target = UsersService.getById(id);
    if (!target) return res.status(404).send("User not found");
    if (target.role !== ERole.player) return res.status(400).send("Can only change role of a player");
    const updated = UsersService.changeRole(id, role as ERole);
    return res.status(200).json(UsersMapper.toDTO(updated!));
});

usersController.patch("/:id/reactivate", (req: Request, res: Response) => {
    const caller = getCaller(req);
    if (!caller) return res.status(401).send("Missing or invalid token");
    if (caller.role !== "admin") return res.status(403).send("Forbidden");
    const id = Number(req.params.id);
    if (!isNumber(id)) return res.status(400).send("Invalid id");
    const updated = UsersService.reactivate(id);
    if (!updated) return res.status(404).send("User not found");
    return res.status(200).json(UsersMapper.toDTO(updated));
});