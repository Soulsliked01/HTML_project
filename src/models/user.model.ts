
// Structure for the login
export interface UserLoginDTO {
    username : string;
    password : string;
}

// Minimal user representation
export interface UserShortDTO {
    id : number;
    firstName : string;
    lastName : string;
}


export interface UserFullDTO {
    id : number;
    firstName : string;
    lastName : string;
    email : string; // unique and @email
    username : string; 
    role : ERole;
    status : EUserStatus; 
    createdAt : string; // date
    updatedAt : string;

}


export interface UserDTO {
    id : number;
    firstName : string;
    lastName : string;
    email : string; // unique and @email
    username : string;
    password?: string  // optionnal only shows for PUT /users/:id body
    role : ERole;
    status : EUserStatus; 
    createdAt : string; // date
    updatedAt : string;

}

export interface User {
    id : number;
    firstName : string;
    lastName : string;
    email : string; // unique and @email
    username : string;
    password : string  // optionnal only shows for PUT /users/:id body
    role : ERole;
    status : EUserStatus; 
    createdAt : string; // date
    updatedAt : string;
}

export interface NewUserDTO {
    firstName : string;
    lastName : string;
    email : string; // unique and @email
    username : string;
    password : string
}

export interface NewUser {
    firstName : string;
    lastName : string;
    email : string; // unique and @email
    username : string;
    password : string
}

export interface UserDBO {
    id : number;
    first_name : string;
    last_name : string;
    email : string; // unique and @email
    username : string;
    password : string  // crypted bcrypt
    role : ERole;
    status : EUserStatus; 
    created_at : string; // date
    updated_at : string;

}

// roles --> default role is player
export enum ERole {
    admin = "admin",
    player = "player",
    referee = "referee",
    trainer = "trainer"
}


export enum EUserStatus {
    active = "active", 
    inactive = "inactive"
};