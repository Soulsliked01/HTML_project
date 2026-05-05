import { Team, TeamDTO, TeamDBO, TeamShortDTO, TeamFullDTO, NewTeam, NewTeamDTO } from "../models/team.model";
import { User, UserShortDTO } from "../models/user.model";

export class TeamsMapper {

    static toShortDTO(team: Team): TeamShortDTO {
        return {
            id:        team.id,
            name:      team.name,
            sportType: team.sportType
        };
    }

    static toDTO(team: Team): TeamDTO {
        return {
            id:          team.id,
            name:        team.name,
            description: team.description,
            sportType:   team.sportType,
            players:     team.players,
            trainerId:   team.trainerId,
            createdAt:   team.createdAt,
            updatedAt:   team.updatedAt
        };
    }

    static toFullDTO(team: Team, players: User[], trainer: User | undefined): TeamFullDTO {
        const playerShorts: UserShortDTO[] = players.map(p => ({
            id:        p.id,
            firstName: p.firstName,
            lastName:  p.lastName
        }));

        const trainerShort: UserShortDTO = trainer
            ? { id: trainer.id, firstName: trainer.firstName, lastName: trainer.lastName }
            : { id: team.trainerId, firstName: '', lastName: '' };

        return {
            id:          team.id,
            name:        team.name,
            description: team.description,
            sportType:   team.sportType,
            players:     playerShorts as [UserShortDTO], // auto fix by AI to match type definition
            trainer:     trainerShort,
            createdAt:   team.createdAt,
            updatedAt:   team.updatedAt
        };
    }

    static fromNewDTO(dto: NewTeamDTO, trainerId: number): NewTeam & { trainerId: number } {
        return {
            name:        dto.name,
            description: dto.description ?? '',
            sportType:   dto.sportType,
            trainerId
        };
    }

    static fromDTO(dto: TeamDTO): Team {
        return {
            id:          dto.id,
            name:        dto.name,
            description: dto.description,
            sportType:   dto.sportType,
            players:     dto.players,
            trainerId:   dto.trainerId,
            createdAt:   dto.createdAt,
            updatedAt:   dto.updatedAt
        };
    }

    static fromDBO(dbo: TeamDBO): Team {
        return {
            id:          dbo.id,
            name:        dbo.name,
            description: dbo.description,
            sportType:   dbo.sportType,
            players:     dbo.players,
            trainerId:   dbo.trainer_id,
            createdAt:   dbo.created_at,
            updatedAt:   dbo.updated_at
        };
    }

    static toDBO(team: Team): TeamDBO {
        return {
            id:          team.id,
            name:        team.name,
            description: team.description,
            sportType:  team.sportType,
            players:     team.players,
            trainer_id:  team.trainerId,
            created_at:  team.createdAt,
            updated_at:  team.updatedAt
        };
    }
}