import { Request, Response, Router } from "express";
import { GamesService } from "../services/games.service";
import { GamesMapper } from "../mappers/games.mapper";
import { isNumber, isString, isNewGameDTO, isEGameStatus } from "../utils/guards";
import { validateFakeToken } from "../utils/token.utils";
import { UsersService } from "../services/users.service";
import { EGameStatus } from "../models/game.model";
import { User } from "../models/user.model";

export const gamesController = Router();

function getCaller(req: Request): User | null {
    const token = req.headers.authorization;
    if (!token || !isString(token)) return null;
    const username = validateFakeToken(token);
    if (!username) return null;
    return UsersService.getByUsername(username) ?? null;
}

gamesController.get("/", (_req: Request, res: Response) => {
    return res.status(200).json(GamesService.getUpcoming().map(g => GamesMapper.toShortDTO(g)));
});

gamesController.get("/:id", (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (!isNumber(id)) return res.status(400).send("Invalid id");
    const game = GamesService.getById(id);
    if (!game) return res.status(404).send("Game not found");
    return res.status(200).json(GamesMapper.toDTO(game));
});

gamesController.post("/", (req: Request, res: Response) => {
    const caller = getCaller(req);
    if (!caller) return res.status(401).send("Missing or invalid token");
    if (caller.role !== "referee") return res.status(403).send("Forbidden: referee role required");
    if (!isNewGameDTO(req.body)) return res.status(400).send("Missing or invalid fields");
    const game = GamesService.create(req.body, caller.id);
    return res.status(201).json(GamesMapper.toDTO(game));
});

gamesController.put("/:id", (req: Request, res: Response) => {
    const caller = getCaller(req);
    if (!caller) return res.status(401).send("Missing or invalid token");
    if (caller.role !== "referee") return res.status(403).send("Forbidden: referee role required");
    const id = Number(req.params.id);
    if (!isNumber(id)) return res.status(400).send("Invalid id");
    if (req.body.id !== id) return res.status(400).send("Body id and path id do not match");
    try {
        const updated = GamesService.update(id, req.body);
        if (!updated) return res.status(404).send("Game not found");
        return res.status(200).json(GamesMapper.toDTO(updated));
    } catch (err: any) {
        return res.status(400).send(err.message);
    }
});

gamesController.delete("/:id", (req: Request, res: Response) => {
    const caller = getCaller(req);
    if (!caller) return res.status(401).send("Missing or invalid token");
    if (caller.role !== "admin") return res.status(403).send("Forbidden");
    const id = Number(req.params.id);
    if (!isNumber(id)) return res.status(400).send("Invalid id");
    const ok = GamesService.delete(id);
    if (!ok) return res.status(500).send("Failed to delete game");
    return res.status(204).send();
});

gamesController.patch("/:id/score/:home/:away", (req: Request, res: Response) => {
    const caller = getCaller(req);
    if (!caller) return res.status(401).send("Missing or invalid token");
    if (caller.role !== "referee") return res.status(403).send("Forbidden");
    const id = Number(req.params.id);
    const home = Number(req.params.home);
    const away = Number(req.params.away);
    if (!isNumber(id) || !isNumber(home) || !isNumber(away)) return res.status(400).send("Invalid values");
    try {
        const updated = GamesService.setScore(id, home, away);
        if (!updated) return res.status(400).send("Game not found");
        return res.status(200).json(GamesMapper.toDTO(updated));
    } catch (err: any) {
        return res.status(400).send(err.message);
    }
});

gamesController.patch("/:id/status/:status", (req: Request, res: Response) => {
    const caller = getCaller(req);
    if (!caller) return res.status(401).send("Missing or invalid token");
    const allowed = ["referee", "trainer", "admin"];
    if (!allowed.includes(caller.role)) return res.status(401).send("Forbidden");
    const id = Number(req.params.id);
    if (!isNumber(id)) return res.status(400).send("Invalid id");
    const status = req.params.status;
    if (!isEGameStatus(status)) return res.status(400).send("Invalid status");
    try {
        const updated = GamesService.setStatus(id, status as EGameStatus);
        if (!updated) return res.status(404).send("Game not found");
        return res.status(200).json(GamesMapper.toDTO(updated));
    } catch (err: any) {
        return res.status(400).send(err.message);
    }
});