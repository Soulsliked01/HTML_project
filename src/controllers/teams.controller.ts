import { Request, Response, Router } from "express";
import { TeamsService } from "../services/teams.service";
import { UsersService } from "../services/users.service";
import { TeamsMapper } from "../mappers/teams.mapper";
import { isNumber, isString, isNewTeamDTO, isTeamDTO } from "../utils/guards";
import { validateFakeToken } from "../utils/token.utils";
import { User } from "../models/user.model";

export const teamsController = Router();

function getCaller(req: Request): User | null {
    const token = req.headers.authorization;
    if (!token || !isString(token)) return null;
    const username = validateFakeToken(token);
    if (!username) return null;
    return UsersService.getByUsername(username) ?? null;
}

teamsController.get("/own", (req: Request, res: Response) => {
    const caller = getCaller(req);
    if (!caller) return res.status(401).send("Missing or invalid token");
    const teams = TeamsService.getOwnTeams(caller.id);
    const allUsers = UsersService.getAll();
    return res.status(200).json(teams.map(t => {
        const players = allUsers.filter(u => t.players.includes(u.id));
        const trainer = allUsers.find(u => u.id === t.trainerId);
        return TeamsMapper.toFullDTO(t, players, trainer);
    }));
});

teamsController.get("/", (_req: Request, res: Response) => {
    return res.status(200).json(TeamsService.getAll().map(t => TeamsMapper.toShortDTO(t)));
});

teamsController.get("/:id", (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (!isNumber(id)) return res.status(400).send("Invalid id");
    const team = TeamsService.getById(id);
    if (!team) return res.status(404).send("Team not found");
    return res.status(200).json(TeamsMapper.toDTO(team));
});

teamsController.post("/", (req: Request, res: Response) => {
    const caller = getCaller(req);
    if (!caller) return res.status(401).send("Missing or invalid token");
    if (caller.role !== "trainer") return res.status(403).send("Forbidden: trainer role required");
    if (!isNewTeamDTO(req.body)) return res.status(400).send("Missing or invalid fields");
    const team = TeamsService.create({ name: req.body.name, description: req.body.description ?? '', sportType: req.body.sportType, trainerId: caller.id });
    return res.status(201).json(TeamsMapper.toDTO(team));
});

teamsController.put("/:id", (req: Request, res: Response) => {
    const caller = getCaller(req);
    if (!caller) return res.status(401).send("Missing or invalid token");
    if (caller.role !== "trainer") return res.status(403).send("Forbidden: trainer role required");
    const id = Number(req.params.id);
    if (!isNumber(id)) return res.status(400).send("Invalid id");
    if (!isTeamDTO(req.body)) return res.status(400).send("Missing or invalid fields");
    if (req.body.id !== id) return res.status(400).send("Body id and path id do not match");
    const updated = TeamsService.update(id, TeamsMapper.fromDTO(req.body));
    if (!updated) return res.status(404).send("Team not found");
    return res.status(200).json(TeamsMapper.toDTO(updated));
});

teamsController.patch("/:id/join", (req: Request, res: Response) => {
    const caller = getCaller(req);
    if (!caller) return res.status(401).send("Missing or invalid token");
    const id = Number(req.params.id);
    if (!isNumber(id)) return res.status(400).send("Invalid id");
    const team = TeamsService.getById(id);
    if (!team) return res.status(404).send("Team not found");
    try {
        const updated = TeamsService.addPlayer(id, caller.id);
        return res.status(200).json(TeamsMapper.toDTO(updated!));
    } catch (err: any) {
        return res.status(400).send(err.message);
    }
});

teamsController.patch("/:id/leave", (req: Request, res: Response) => {
    const caller = getCaller(req);
    if (!caller) return res.status(401).send("Missing or invalid token");
    const id = Number(req.params.id);
    if (!isNumber(id)) return res.status(400).send("Invalid id");
    const updated = TeamsService.removePlayer(id, caller.id);
    if (!updated) return res.status(404).send("Team not found or user not in team");
    return res.status(200).json(TeamsMapper.toDTO(updated));
});