import { UserShortDTO } from "./user.model";

export interface TeamShortDTO {
    id : number;
    name : string;
    sportType : ESportType;
}

export interface Team {
    id : number;
    name : string;
    description : string;
    sportType : ESportType;
    players : [number]; // id's of players
    trainerId : number; // id of trainer
    createdAt : string;
    updatedAt : string;
}

export interface NewTeam {
    name : string;
    description? : string;
    sportType : ESportType;
}   

export interface TeamDTO{
    id : number;
    name : string;
    description : string;
    sportType : ESportType;
    players : [number]; // id's of players
    trainerId : number; // id of trainer
    createdAt : string;
    updatedAt : string;
}

export interface TeamFullDTO{
    id : number;
    name : string;
    description : string;
    sportType : ESportType;
    players : [UserShortDTO];
    trainer : UserShortDTO;
    createdAt : string;
    updatedAt : string;
}

export interface NewTeamDTO {
    name : string;
    description? : string;
    sportType : ESportType;
}

export interface TeamDBO{
    id : number;
    name : string;
    description : string;
    sportType : ESportType;
    players : [number];
    trainer_id : number;
    created_at: string;
    updated_at : string;
}



export enum ESportType {
    football =  "football", 
    basketball = "basketball", 
    tennis = "tennis", 
    volleyball = "volleyball", 
    handball = "handball"
}

