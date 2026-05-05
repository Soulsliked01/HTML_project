import { Field, FieldDTO, FieldDBO, NewFieldDTO } from "../models/field.model";

export class FieldsMapper {

    static toDTO(field: Field): FieldDTO {
        return {
            id:        field.id,
            name:      field.name,
            location:  field.location,
            createdAt: field.createdAt,
            updatedAt: field.updatedAt
        };
    }

    static fromNewDTO(dto: NewFieldDTO): Omit<Field, 'id'> {
        const now = new Date().toISOString();
        return {
            name:      dto.name,
            location:  dto.location,
            createdAt: now,
            updatedAt: now
        };
    }

    static fromDTO(dto: FieldDTO): Field {
        return {
            id:        dto.id,
            name:      dto.name,
            location:  dto.location,
            createdAt: dto.createdAt,
            updatedAt: dto.updatedAt
        };
    }

    static fromDBO(dbo: FieldDBO): Field {
        return {
            id:        dbo.id,
            name:      dbo.name,
            location:  dbo.location,
            createdAt: dbo.created_at,
            updatedAt: dbo.updated_at
        };
    }

    static toDBO(field: Field): FieldDBO {
        return {
            id:         field.id,
            name:       field.name,
            location:   field.location,
            created_at: field.createdAt,
            updated_at: field.updatedAt
        };
    }
}