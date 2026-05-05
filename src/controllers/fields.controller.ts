import { Request, Response, Router } from "express";
import { FieldsService } from "../services/fields.service";
import { FieldsMapper } from "../mappers/fields.mapper";
import { isNumber, isString, isNewFieldDTO, isFieldDTO } from "../utils/guards";
import { validateFakeToken } from "../utils/token.utils";
import { UsersService } from "../services/users.service";
import { User } from "../models/user.model";

export const fieldsController = Router();

function getCaller(req: Request): User | null {
    const token = req.headers.authorization;
    if (!token || !isString(token)) return null;
    const username = validateFakeToken(token);
    if (!username) return null;
    return UsersService.getByUsername(username) ?? null;
}

fieldsController.get("/", (_req: Request, res: Response) => {
    return res.status(200).json(FieldsService.getAll().map(f => FieldsMapper.toDTO(f)));
});

fieldsController.get("/:id", (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (!isNumber(id)) return res.status(400).send("Invalid id");
    const field = FieldsService.getById(id);
    if (!field) return res.status(404).send("Field not found");
    return res.status(200).json(FieldsMapper.toDTO(field));
});

fieldsController.post("/", (req: Request, res: Response) => {
    const caller = getCaller(req);
    if (!caller) return res.status(401).send("Missing or invalid token");
    if (caller.role !== "admin") return res.status(403).send("Forbidden");
    if (!isNewFieldDTO(req.body)) return res.status(400).send("Missing or invalid fields");
    const field = FieldsService.create(req.body);
    return res.status(201).json(FieldsMapper.toDTO(field));
});

fieldsController.put("/:id", (req: Request, res: Response) => {
    const caller = getCaller(req);
    if (!caller) return res.status(401).send("Missing or invalid token");
    if (caller.role !== "admin") return res.status(403).send("Forbidden");
    const id = Number(req.params.id);
    if (!isNumber(id)) return res.status(400).send("Invalid id");
    if (!isFieldDTO(req.body)) return res.status(400).send("Missing or invalid fields");
    if (req.body.id !== id) return res.status(400).send("Body id and path id do not match");
    const updated = FieldsService.update(id, FieldsMapper.fromDTO(req.body));
    if (!updated) return res.status(404).send("Field not found");
    return res.status(200).json(FieldsMapper.toDTO(updated));
});