import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
export interface JwtPayload {
    sub: string;
    email: string;
    role: string;
}
export interface AuthResponse {
    access_token: string;
    user: User;
}
export declare class AuthService {
    private usersService;
    private jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    validateUser(email: string, password: string): Promise<User | null>;
    login(email: string, password: string): Promise<AuthResponse>;
    register(userData: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
    }): Promise<AuthResponse>;
}
