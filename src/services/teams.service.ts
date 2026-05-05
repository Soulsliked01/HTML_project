import { TeamsMapper } from '../mappers/teams.mapper';
import { Team, TeamDBO } from '../models/team.model';
import { FilesService } from './files.service';
import { LoggerService } from './logger.service';

export class TeamsService {
    protected static dbPath = 'data/teams.json';

    private static readDB(): Team[] {
        try {
            return FilesService.readFile<TeamDBO>(this.dbPath).map(d => TeamsMapper.fromDBO(d));
        } catch (e) { LoggerService.error(e); return []; }
    }

    private static writeDB(teams: Team[]): boolean {
        try {
            FilesService.writeFile<TeamDBO>(this.dbPath, teams.map(t => TeamsMapper.toDBO(t)));
            return true;
        } catch (e) { LoggerService.error(e); return false; }
    }

    private static getNewID(items: Team[]): number {
        return items.length === 0 ? 1 : Math.max(...items.map(t => t.id)) + 1;
    }

    public static getAll(): Team[] { return this.readDB(); }

    public static getById(id: number): Team | undefined {
        return this.readDB().find(t => t.id === id);
    }

    public static create(data: { name: string; description: string; sportType: any; trainerId: number }): Team {
        const teams = this.readDB();
        const now = new Date().toISOString();
        const team: Team = {
            id: this.getNewID(teams),
            name: data.name,
            description: data.description,
            sportType: data.sportType,
            players: [] as unknown as Team['players'],
            trainerId: data.trainerId,
            createdAt: now,
            updatedAt: now
        };
        teams.push(team);
        this.writeDB(teams);
        return team;
    }

    public static update(id: number, updates: Partial<Team>): Team | null {
        const teams = this.readDB();
        const index = teams.findIndex(t => t.id === id);
        if (index === -1) return null;
        teams[index] = { ...teams[index], ...updates, id, updatedAt: new Date().toISOString() };
        this.writeDB(teams);
        return teams[index];
    }

    public static addPlayer(teamId: number, userId: number): Team | null {
        const teams = this.readDB();
        const index = teams.findIndex(t => t.id === teamId);
        if (index === -1) return null;
        if (teams[index].players.includes(userId)) throw new Error("User already in team");
        teams[index].players.push(userId);
        teams[index].updatedAt = new Date().toISOString();
        this.writeDB(teams);
        return teams[index];
    }

    public static removePlayer(teamId: number, userId: number): Team | null {
        const teams = this.readDB();
        const index = teams.findIndex(t => t.id === teamId);
        if (index === -1) return null;
        if (!teams[index].players.includes(userId)) return null;
        teams[index].players = teams[index].players.filter(p => p !== userId) as Team['players'];
        teams[index].updatedAt = new Date().toISOString();
        this.writeDB(teams);
        return teams[index];
    }

    public static getOwnTeams(userId: number): Team[] {
        return this.readDB().filter(t => t.players.includes(userId) || t.trainerId === userId);
    }
}