import { GamesMapper} from '../mappers/games.mapper';
import { EGameStatus, Game, GameDBO, NewGameDTO } from '../models/game.model';
import { FilesService } from './files.service';
import { LoggerService } from './logger.service';

export class GamesService {
    protected static dbPath = 'data/games.json';

    private static readDB(): Game[] {
        try {
            return FilesService.readFile<GameDBO>(this.dbPath).map(d => GamesMapper.fromDBO(d));
        } catch (e) { LoggerService.error(e); return []; }
    }

    private static writeDB(games: Game[]): boolean {
        try {
            FilesService.writeFile<GameDBO>(this.dbPath, games.map(g => GamesMapper.toDBO(g)));
            return true;
        } catch (e) { LoggerService.error(e); return false; }
    }

    private static getNewID(items: Game[]): number {
        return items.length === 0 ? 1 : Math.max(...items.map(g => g.id)) + 1;
    }

    private static computeStatus(game: Partial<Game>): EGameStatus {
        if (game.fieldId && game.scheduledDate) return EGameStatus.scheduled;
        return EGameStatus.created;
    }

    public static getAll(): Game[] { return this.readDB(); }
    public static getById(id: number): Game | undefined { return this.readDB().find(g => g.id === id); }

    public static getUpcoming(): Game[] {
        const now = new Date();
        return this.readDB().filter(g => {
            if (g.status === EGameStatus.finished || g.status === EGameStatus.cancelled) return false;
            if (!g.scheduledDate) return true;
            return new Date(g.scheduledDate) >= now;
        });
    }

    public static create(dto: NewGameDTO, refereeId: number): Game {
        const games = this.readDB();
        const now = new Date().toISOString();
        const game: Game = {
            id:            this.getNewID(games),
            status:        EGameStatus.created,
            name:          dto.name ?? null,
            fieldId:       dto.fieldId ?? null,
            refereeId:     dto.refereeId ?? refereeId,
            homeTeamId:    dto.homeTeamId ?? null,
            awayTeamId:    dto.awayTeamId ?? null,
            homeScore:     0,
            awayScore:     0,
            scheduledDate: dto.scheduledDate ?? null,
            createdAt:     now,
            updateAt:     now
        };
        game.status = this.computeStatus(game);
        games.push(game);
        this.writeDB(games);
        return game;
    }

    public static update(id: number, dto: Partial<Game>): Game | null {
        const games = this.readDB();
        const index = games.findIndex(g => g.id === id);
        if (index === -1) return null;

        const current = games[index];
        if (current.status === EGameStatus.finished || current.status === EGameStatus.cancelled) {
            throw new Error("Cannot update a finished or cancelled game");
        }

        // En started: fieldId, refereeId, homeTeamId, awayTeamId sont verrouillés
        if (current.status === EGameStatus.started) {
            dto.fieldId = current.fieldId;
            dto.refereeId = current.refereeId;
            dto.homeTeamId = current.homeTeamId;
            dto.awayTeamId = current.awayTeamId;
        }

        // Vérifie conflit de terrain (même champ + même date + autre game)
        if (dto.fieldId && dto.scheduledDate) {
            const conflict = games.find(g =>
                g.id !== id &&
                g.fieldId === dto.fieldId &&
                g.scheduledDate === dto.scheduledDate &&
                g.status !== EGameStatus.cancelled
            );
            if (conflict) throw new Error("Field already booked for this date");
        }

        const updated: Game = {
            ...current,
            ...dto,
            id,
            updateAt: new Date().toISOString()
        };
        updated.status = this.computeStatus(updated);
        // Si le status était started/finished/cancelled, on le préserve
        if ([EGameStatus.started, EGameStatus.finished, EGameStatus.cancelled].includes(current.status)) {
            updated.status = current.status;
        }

        games[index] = updated;
        this.writeDB(games);
        return updated;
    }

    public static delete(id: number): boolean {
        const games = this.readDB();
        const index = games.findIndex(g => g.id === id);
        if (index === -1) return false;
        games.splice(index, 1);
        return this.writeDB(games);
    }

    public static setScore(id: number, home: number, away: number): Game | null {
        const games = this.readDB();
        const index = games.findIndex(g => g.id === id);
        if (index === -1) return null;
        if (games[index].status !== EGameStatus.started) throw new Error("Game is not started");
        games[index].homeScore = home;
        games[index].awayScore = away;
        games[index].updateAt = new Date().toISOString();
        this.writeDB(games);
        return games[index];
    }

    public static setStatus(id: number, newStatus: EGameStatus): Game | null {
        const games = this.readDB();
        const index = games.findIndex(g => g.id === id);
        if (index === -1) return null;

        const current = games[index];
        const from = current.status;

        const allowed: Partial<Record<EGameStatus, EGameStatus[]>> = {
            [EGameStatus.created]:   [EGameStatus.cancelled],
            [EGameStatus.scheduled]: [EGameStatus.started, EGameStatus.cancelled],
            [EGameStatus.started]:   [EGameStatus.finished]
        };

        if (!allowed[from]?.includes(newStatus)) {
            throw new Error(`Invalid transition: ${from} → ${newStatus}`);
        }

        if (newStatus === EGameStatus.started) {
            if (!current.fieldId || !current.refereeId || !current.homeTeamId || !current.awayTeamId) {
                throw new Error("Cannot start: missing fieldId, refereeId, homeTeamId or awayTeamId");
            }
            if (current.homeScore !== 0 || current.awayScore !== 0) {
                throw new Error("Cannot start: scores must be 0");
            }
        }

        games[index].status = newStatus;
        games[index].updateAt = new Date().toISOString();
        this.writeDB(games);
        return games[index];
    }
}