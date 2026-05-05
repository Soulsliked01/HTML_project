import { User, UserDTO, NewUser, NewUserDTO, UserDBO, UserFullDTO, UserShortDTO } from "../models/user.model";

export class UsersMapper {

    static toDTO(user: User): UserDTO {
        return {
            id:        user.id,
            firstName: user.firstName,
            lastName:  user.lastName,
            email:     user.email,
            username:  user.username,   // BUG FIX: was incorrectly mapped to user.email
            password:  user.password,
            role:      user.role,
            status:    user.status,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };
    }

    static toShortDTO(user: User): UserShortDTO {
        return {
            id:        user.id,
            firstName: user.firstName,
            lastName:  user.lastName
        };
    }

    static toFullDTO(user: User): UserFullDTO {
        return {
            id:        user.id,
            firstName: user.firstName,
            lastName:  user.lastName,
            email:     user.email,
            username:  user.username,
            role:      user.role,
            status:    user.status,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };
    }

    static fromNewDTO(newUser: NewUserDTO): NewUser {
        return {
            firstName: newUser.firstName,
            lastName:  newUser.lastName,
            email:     newUser.email,
            username:  newUser.username,
            password:  newUser.password
        };
    }

    static fromDTO(dto: UserDTO): User {
        return {
            id:        dto.id,
            firstName: dto.firstName,
            lastName:  dto.lastName,
            email:     dto.email,
            username:  dto.username,
            password:  dto.password ?? '',
            role:      dto.role,
            status:    dto.status,
            createdAt: dto.createdAt,
            updatedAt: dto.updatedAt
        };
    }

    static fromDBO(dbo: UserDBO): User {
        return {
            id:        dbo.id,
            firstName: dbo.first_name,
            lastName:  dbo.last_name,
            email:     dbo.email,
            username:  dbo.username,
            password:  dbo.password,
            role:      dbo.role,
            status:    dbo.status,
            createdAt: dbo.created_at,
            updatedAt: dbo.updated_at
        };
    }

    static toDBO(user: User): UserDBO {
        return {
            id:         user.id,
            first_name: user.firstName,
            last_name:  user.lastName,
            email:      user.email,
            username:   user.username,
            password:   user.password,
            role:       user.role,
            status:     user.status,
            created_at: user.createdAt,
            updated_at: user.updatedAt  // BUG FIX: was incorrectly mapped to user.createdAt
        };
    }
}