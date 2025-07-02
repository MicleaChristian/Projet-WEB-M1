import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { User, UserRole } from '../users/entities/user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    password: 'hashedPassword',
    firstName: 'Test',
    lastName: 'User',
    role: UserRole.USER,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUsersService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
    validatePassword: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);

    // Reset mocks
    jest.clearAllMocks();
    expect(usersService).toBeDefined();
    expect(jwtService).toBeDefined();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user when credentials are valid', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      mockUsersService.validatePassword.mockResolvedValue(true);

      const result = await service.validateUser('test@example.com', 'password');

      expect(result).toEqual(mockUser);
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(mockUsersService.validatePassword).toHaveBeenCalledWith('password', 'hashedPassword');
    });

    it('should return null when user is not found', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      const result = await service.validateUser('test@example.com', 'password');

      expect(result).toBeNull();
    });

    it('should return null when password is invalid', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      mockUsersService.validatePassword.mockResolvedValue(false);

      const result = await service.validateUser('test@example.com', 'wrongpassword');

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return auth response when credentials are valid', async () => {
      const mockToken = 'mock-jwt-token';
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      mockUsersService.validatePassword.mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue(mockToken);

      const result = await service.login('test@example.com', 'password');

      expect(result).toEqual({
        access_token: mockToken,
        user: mockUser,
      });
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(service.login('test@example.com', 'wrongpassword'))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('should create new user and return auth response', async () => {
      const userData = {
        email: 'new@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
      };
      const mockToken = 'mock-jwt-token';

      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue(mockToken);

      const result = await service.register(userData);

      expect(result).toEqual({
        access_token: mockToken,
        user: mockUser,
      });
      expect(mockUsersService.create).toHaveBeenCalledWith(userData);
    });

    it('should throw UnauthorizedException when user already exists', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'Existing',
        lastName: 'User',
      };

      mockUsersService.findByEmail.mockResolvedValue(mockUser);

      await expect(service.register(userData))
        .rejects.toThrow(UnauthorizedException);
    });
  });
}); 