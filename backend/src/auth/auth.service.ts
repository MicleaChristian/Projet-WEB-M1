import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User as PrismaUser } from '@prisma/client';
import { User, UserRole } from '../users/entities/user.entity';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  private convertPrismaUserToGraphQLUser(prismaUser: PrismaUser): User {
    return {
      id: prismaUser.id,
      email: prismaUser.email,
      password: prismaUser.password,
      firstName: prismaUser.firstName,
      lastName: prismaUser.lastName,
      role: prismaUser.role as UserRole,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
    };
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    
    if (user && await this.usersService.validatePassword(password, user.password)) {
      return this.convertPrismaUserToGraphQLUser(user);
    }
    
    return null;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const user = await this.validateUser(email, password);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<AuthResponse> {
    const existingUser = await this.usersService.findByEmail(userData.email);
    
    if (existingUser) {
      throw new UnauthorizedException('User already exists');
    }

    const prismaUser = await this.usersService.create(userData);
    const user = this.convertPrismaUserToGraphQLUser(prismaUser);
    
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }
} 