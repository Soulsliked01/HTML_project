import { UsersMapper } from '../mappers/users.mapper';
import { ERole, EUserStatus, NewUser, User, UserDBO } from '../models/user.model';
import { FilesService } from './files.service';
import { LoggerService } from './logger.service';

export class UsersService {

    /** Path to the users database file */
    protected static dbPath: string = 'data/users.json';
    
    /**
     * Reads all users from the database.
     * @returns an array of User objects
     */
    private static readUsersDB(): User[] {
        let dbos: UserDBO[] = [];
        try {
            dbos = FilesService.readFile<UserDBO>(this.dbPath);
        } catch (error) {
            LoggerService.error(error);
            return [];
        }

        const items: User[] = [];
        for (const dbo of dbos) {
            items.push(UsersMapper.fromDBO(dbo));
        }
        return items;
    }

    /**
     * Writes the given list of users to the database.
     * @returns true if successful, false otherwise
     */
    protected static writeUsersDB(users: User[]): boolean {
        const dbos: UserDBO[] = users.map(u => UsersMapper.toDBO(u));

        try {
            FilesService.writeFile<UserDBO>(this.dbPath, dbos);
        } catch (error) {
            LoggerService.error(error);
            return false;
        }
        return true;
    }

    /**
     * Generates a new unique ID for a user.
     */
    protected static getNewID(items: User[]): number {
        if (items.length === 0) return 1;

        if (!('id' in items[0])) {
            throw new Error('Item does not have an id property');
        }

        const maxId = Math.max(...items.map(u => u.id));
        return maxId + 1;
    }

    /**
     * Returns all users.
     */
    public static getAll(): User[] {
        return UsersService.readUsersDB();
    }

    /**
     * Returns a user by ID.
     */
    public static getById(id: number): User | undefined {
        return UsersService.readUsersDB().find(u => u.id === id);
    }

    /**
     * Returns a user by username.
     */
    public static getByUsername(username: string): User | undefined {
        return UsersService.readUsersDB().find(u => u.username === username);
    }

    /**
     * Returns a user by email.
     */
    public static getByEmail(email: string): User | undefined {
        return UsersService.readUsersDB().find(u => u.email === email);
    }

    /**
     * Creates a new user.
     */
    public static create(newUser: NewUser): User | undefined {
        const data = UsersService.readUsersDB();

        // Check email uniqueness
        if (data.some(u => u.email === newUser.email)) {
            throw new Error("Email already exists");
        }

        // Check username uniqueness
        if (data.some(u => u.username === newUser.username)) {
            throw new Error("Username already exists");
        }

        const user: User = {
            id: UsersService.getNewID(data),
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            email: newUser.email,
            username: newUser.username,
            password: newUser.password, // TODO: hash later
            role: ERole.player,
            status: EUserStatus.active,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        data.push(user);

        if (!UsersService.writeUsersDB(data)) {
            return undefined;
        }

        return user;
    }

    /**
     * Updates an existing user.
     */
    public static update(id: number, updates: Partial<User>): User | null {
        const users = this.readUsersDB();
        const index = users.findIndex(u => u.id === id);

        if (index === -1) return null;

        // Prevent modification of protected fields
        delete updates.id;
        delete updates.role;
        delete updates.status;

        const updatedUser: User = {
            ...users[index], // operator ... used to copy all properties of the existing user,
            ...updates, // operator ... used to copy all properties of the updates object, which will overwrite any existing properties with the same name,
            updatedAt: new Date().toISOString()
        };

        users[index] = updatedUser;
        this.writeUsersDB(users);

        return updatedUser;
    }

    /**
     * Soft-deletes a user (sets status to inactive).
     */
    public static delete(id: number): boolean {
        const users = this.readUsersDB();
        const index = users.findIndex(u => u.id === id);

        if (index === -1) return false;

        users[index].status = EUserStatus.inactive;
        users[index].updatedAt = new Date().toISOString();

        return this.writeUsersDB(users);
    }

    /**
     * Changes a user's role.
     */
    public static changeRole(id: number, role: ERole): User | null {
        const users = this.readUsersDB();
        const index = users.findIndex(u => u.id === id);

        if (index === -1) return null;

        users[index].role = role;
        users[index].updatedAt = new Date().toISOString();

        this.writeUsersDB(users);
        return users[index];
    }

    /**
     * Reactivates a previously inactive user.
     */
    public static reactivate(id: number): User | null {
        const users = this.readUsersDB();
        const index = users.findIndex(u => u.id === id);

        if (index === -1) return null;

        users[index].status = EUserStatus.active;
        users[index].updatedAt = new Date().toISOString();

        this.writeUsersDB(users);
        return users[index];
    }
}
