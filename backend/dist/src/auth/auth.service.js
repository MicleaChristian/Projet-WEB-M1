"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const users_service_1 = require("../users/users.service");
let AuthService = class AuthService {
    constructor(usersService, jwtService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
    }
    convertPrismaUserToGraphQLUser(prismaUser) {
        return {
            id: prismaUser.id,
            email: prismaUser.email,
            password: prismaUser.password,
            firstName: prismaUser.firstName,
            lastName: prismaUser.lastName,
            role: prismaUser.role,
            createdAt: prismaUser.createdAt,
            updatedAt: prismaUser.updatedAt,
        };
    }
    async validateUser(email, password) {
        const user = await this.usersService.findByEmail(email);
        if (user && await this.usersService.validatePassword(password, user.password)) {
            return this.convertPrismaUserToGraphQLUser(user);
        }
        return null;
    }
    async login(email, password) {
        const user = await this.validateUser(email, password);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };
        return {
            access_token: this.jwtService.sign(payload),
            user,
        };
    }
    async register(userData) {
        const existingUser = await this.usersService.findByEmail(userData.email);
        if (existingUser) {
            throw new common_1.UnauthorizedException('User already exists');
        }
        const prismaUser = await this.usersService.create(userData);
        const user = this.convertPrismaUserToGraphQLUser(prismaUser);
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };
        return {
            access_token: this.jwtService.sign(payload),
            user,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map