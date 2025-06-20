import { AuthService } from './auth.service';
import { AuthResponse } from './dto/auth-response.type';
import { LoginInput } from './dto/login.input';
import { RegisterInput } from './dto/register.input';
import { User } from '../users/entities/user.entity';
export declare class AuthResolver {
    private authService;
    constructor(authService: AuthService);
    login(loginInput: LoginInput): Promise<AuthResponse>;
    register(registerInput: RegisterInput): Promise<AuthResponse>;
    me(user: User): Promise<User>;
}
