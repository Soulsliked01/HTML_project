import { FieldsMapper } from '../mappers/fields.mapper';
import { Field, FieldDBO, NewFieldDTO } from '../models/field.model';
import { FilesService } from './files.service';
import { LoggerService } from './logger.service';

export class FieldsService {
    protected static dbPath = 'data/fields.json';

    private static readDB(): Field[] {
        try {
            return FilesService.readFile<FieldDBO>(this.dbPath).map(d => FieldsMapper.fromDBO(d));
        } catch (e) { LoggerService.error(e); return []; }
    }

    private static writeDB(fields: Field[]): boolean {
        try {
            FilesService.writeFile<FieldDBO>(this.dbPath, fields.map(f => FieldsMapper.toDBO(f)));
            return true;
        } catch (e) { LoggerService.error(e); return false; }
    }

    private static getNewID(items: Field[]): number {
        return items.length === 0 ? 1 : Math.max(...items.map(f => f.id)) + 1;
    }

    public static getAll(): Field[] { return this.readDB(); }

    public static getById(id: number): Field | undefined {
        return this.readDB().find(f => f.id === id);
    }

    public static create(dto: NewFieldDTO): Field {
        const fields = this.readDB();
        const now = new Date().toISOString();
        const field: Field = { id: this.getNewID(fields), name: dto.name, location: dto.location, createdAt: now, updatedAt: now };
        fields.push(field);
        this.writeDB(fields);
        return field;
    }

    public static update(id: number, updates: Partial<Field>): Field | null {
        const fields = this.readDB();
        const index = fields.findIndex(f => f.id === id);
        if (index === -1) return null;
        fields[index] = { ...fields[index], ...updates, id, updatedAt: new Date().toISOString() };
        this.writeDB(fields);
        return fields[index];
    }

    public static isFieldAvailable(fieldId: number, date: string, excludeGameId?: number): boolean {
        // Vérifié dans games.service
        return true;
    }
}