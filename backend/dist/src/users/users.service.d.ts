import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findByEmail(email: string): Promise<User | undefined>;
    findById(id: string): Promise<User | undefined>;
    create(userData: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
    }): Promise<User>;
    validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean>;
}
