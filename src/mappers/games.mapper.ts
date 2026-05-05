import { Game, GameDTO, GameDBO, GameShortDTO, NewGameDTO } from "../models/game.model";

export class GamesMapper {

    static toShortDTO(game: Game): GameShortDTO {
        return {
            id:            game.id,
            status:        game.status,
            name:          game.name,
            fieldId:       game.fieldId,
            homeTeamId:    game.homeTeamId,
            awayTeamId:    game.awayTeamId,
            scheduledDate: game.scheduledDate
        };
    }

    static toDTO(game: Game): GameDTO {
        return {
            id:            game.id,
            status:        game.status,
            name:          game.name,
            fieldId:       game.fieldId,
            refereeId:     game.refereeId,
            homeTeamId:    game.homeTeamId,
            awayTeamId:    game.awayTeamId,
            homeScore:     game.homeScore,
            awayScore:     game.awayScore,
            scheduledDate: game.scheduledDate,
            createdAt:     game.createdAt,
            updateAt:     game.updateAt
        };
    }

    static fromDBO(dbo: GameDBO): Game {
        return {
            id:            dbo.id,
            status:        dbo.status,
            name:          dbo.name,
            fieldId:       dbo.field_id,
            refereeId:     dbo.referee_id,
            homeTeamId:    dbo.home_team_id,
            awayTeamId:    dbo.away_team_id,
            homeScore:     dbo.home_score,
            awayScore:     dbo.away_score,
            scheduledDate: dbo.scheduled_date,
            createdAt:     dbo.created_at,
            updateAt:     dbo.update_at
        };
    }

    static toDBO(game: Game): GameDBO {
        return {
            id:             game.id,
            status:         game.status,
            name:           game.name,
            field_id:       game.fieldId,
            referee_id:     game.refereeId,
            home_team_id:   game.homeTeamId,
            away_team_id:   game.awayTeamId,
            home_score:     game.homeScore,
            away_score:     game.awayScore,
            scheduled_date: game.scheduledDate,
            created_at:     game.createdAt,
            update_at:     game.updateAt
        };
    }
}