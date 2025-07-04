export declare enum UserRole {
    ADMIN = "ADMIN",
    USER = "USER"
}
export declare class User {
    id: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
}
