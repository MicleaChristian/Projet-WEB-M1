import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | undefined> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string): Promise<User | undefined> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async create(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    return this.prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
      },
    });
  }

  async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
} 