import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

// Mock bcrypt
jest.mock('bcrypt');
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('UsersService', () => {
  let service: UsersService;

  const mockUser = {
    id: 'user-id',
    email: 'test@example.com',
    password: 'hashedPassword',
    firstName: 'Test',
    lastName: 'User',
    role: 'USER' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);

    // Reset all mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByEmail', () => {
    it('should find a user by email', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should return null if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new user with hashed password', async () => {
      const userData = {
        email: 'new@example.com',
        password: 'plainPassword',
        firstName: 'New',
        lastName: 'User',
      };

      const hashedPassword = 'hashedPassword';
      mockBcrypt.hash.mockResolvedValue(hashedPassword as never);
      mockPrismaService.user.create.mockResolvedValue(mockUser);

      const result = await service.create(userData);

      expect(result).toEqual(mockUser);
      expect(mockBcrypt.hash).toHaveBeenCalledWith('plainPassword', 10);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: 'new@example.com',
          password: hashedPassword,
          firstName: 'New',
          lastName: 'User',
        },
      });
    });
  });

  describe('validatePassword', () => {
    it('should return true for valid password', async () => {
      mockBcrypt.compare.mockResolvedValue(true as never);

      const result = await service.validatePassword('plainPassword', 'hashedPassword');

      expect(result).toBe(true);
      expect(mockBcrypt.compare).toHaveBeenCalledWith('plainPassword', 'hashedPassword');
    });

    it('should return false for invalid password', async () => {
      mockBcrypt.compare.mockResolvedValue(false as never);

      const result = await service.validatePassword('wrongPassword', 'hashedPassword');

      expect(result).toBe(false);
    });
  });

  describe('findById', () => {
    it('should find a user by id', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findById('user-id');

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-id' },
      });
    });

    it('should return null if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.findById('nonexistent-id');

      expect(result).toBeNull();
    });
  });
}); 