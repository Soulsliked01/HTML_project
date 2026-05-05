export enum EGameStatus {
    created = "created",
    scheduled = "scheduled",
    started = "started",
    finished = "finished", 
    cancelled = "cancelled"
}

export interface GameShortDTO {
    id : number;
    status : EGameStatus;
    name : string;
    fieldId : number // id of field
    homeTeamId : number;
    awayTeamId : number;
    scheduledDate : string;
}

export interface GameDTO {
    id : number;
    status : EGameStatus;
    name : string;
    refereeId : number;
    fieldId : number // id of field
    homeTeamId : number;
    awayTeamId : number;
    homeScore : number;
    awayScore : number;
    scheduledDate : string;
    createdAt : string;
    updateAt : String;
}

export interface Game {
    id : number;
    status : EGameStatus;
    name : string;
    refereeId : number;
    fieldId : number // id of field
    homeTeamId : number;
    awayTeamId : number;
    homeScore : number;
    awayScore : number;
    scheduledDate : string;
    createdAt : string;
    updateAt : String;
}

export interface NewGameDTO {
    name : string;
    fieldId : number;
    refereeId : number;
    homeTeamId : number;
    awayTeamId : number;
    scheduledDate : string;
}

export interface NewGame {
    name : string;
    fieldId : number;
    refereeId : number;
    homeTeamId : number;
    awayTeamId : number;
    scheduledDate : string;
}


export interface GameDBO {
    id : number;
    status : EGameStatus;
    name : string;
    referee_id : number;
    field_id : number // id of field
    home_team_id : number;
    away_team_id : number;
    home_score : number;
    away_score : number;
    scheduled_date : string;
    created_at : string;
    update_at : String;
}