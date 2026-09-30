import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaService } from '../database/prisma.service';
import bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('UserService', () => {
  let userService: UserService;

  const mockPrismaService = {
    user: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('createUser', () => {
    it('should be able to create user', async () => {
      const mockCreatedUser = {
        id: 1,
        name: 'jest',
        email: 'jest@email.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const createUserDto = {
        name: 'jest',
        email: 'jest@email.com',
        password: 'jest',
      };

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword123');
      mockPrismaService.user.create.mockResolvedValue(mockCreatedUser);

      const user = await userService.signup(createUserDto);

      expect(user).toEqual(mockCreatedUser);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          name: 'jest',
          email: 'jest@email.com',
          password: 'hashedPassword123',
        },
      });
    });
  });

  describe('getUser', () => {
    it('should return one user', async () => {
      const mockUser = {
        id: 1,
        name: 'jest',
        email: 'jest@email.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);

      const user = await userService.getUser(1);

      expect(user).toEqual(mockUser);
      expect(mockPrismaService.user.findFirst).toHaveBeenCalledWith({
        where: { id: 1 },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });

    it('should throw NotFoundException if user is not found', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      await expect(userService.getUser(9)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAllUsers', () => {
    it('shold return all Users', async () => {
      const mockUsers = [
        {
          id: 1,
          name: 'jest',
          email: 'jest@email.com',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          name: 'teste2',
          email: 'teste2@email.com',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);

      const users = await userService.findAllUsers();

      expect(users).toEqual(mockUsers);
      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        omit: { password: true },
      });
    });
  });

  describe('deleteUser', () => {
    it('shold delete a user', async () => {
      const mockUser = {
        id: 1,
        name: 'jest',
        email: 'jest@email.com',
        password: 'hash123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);
      mockPrismaService.user.delete.mockResolvedValue(mockUser);

      const user = await userService.deleteUser(1);

      expect(user).toEqual({
        message: 'User removed successfully',
        user: mockUser,
      });
      expect(mockPrismaService.user.delete).toHaveBeenCalledWith({
        where: { id: 1 },
        select: { id: true, name: true, email: true },
      });
    });

    it('should throw NotFoundException if user is not found', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      await expect(userService.deleteUser(7)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateUser', () => {
    it('should update user whithout changing password', async () => {
      const existingUser = {
        id: 1,
        name: 'old name',
        email: 'old@email.com',
        password: 'hash123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedUser = {
        id: 1,
        name: 'new name',
        email: 'new@email.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findFirst.mockResolvedValue(existingUser);
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const updateUserDto = { name: 'new name', email: 'new@email.com' };

      const result = await userService.updateUser(updateUserDto, 1);

      expect(result).toEqual({
        message: 'User update successfully.',
        user: updatedUser,
      });
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          name: 'new name',
          email: 'new@email.com',
        },
        omit: { password: true },
      });
    });
    it('should throw BadRequestException if changing password without currentPassword', async () => {
      const existingUser = {
        id: 1,
        name: 'jest',
        email: 'jest@email.com',
        password: 'hash123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findFirst.mockResolvedValue(existingUser);

      const updateUserDto = { password: 'newPassword' };

      await expect(userService.updateUser(updateUserDto, 1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('it shold throw UnauthorizedException if current password is incorrect ', async () => {
      const existingUser = {
        id: 1,
        name: 'jest',
        email: 'jest@email.com',
        password: 'hash123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findFirst.mockResolvedValue(existingUser);

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const updateUserDto = {
        password: 'newPassword',
        currentPassword: 'whrongPassword',
      };

      await expect(userService.updateUser(updateUserDto, 1)).rejects.toThrow(
        UnauthorizedException,
      );
    });
    it('should update password when currentPassword is correct', async () => {
      const existingUser = {
        id: 1,
        name: 'jest',
        email: 'jest@email.com',
        password: 'hash123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updateUser = {
        id: 1,
        name: 'jest',
        email: 'jest@email.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findFirst.mockResolvedValue(existingUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('newHashPassword');
      mockPrismaService.user.update.mockResolvedValue(updateUser);

      const updateUserDto = {
        password: 'newPassword',
        currentPassword: 'hash123',
      };

      const result = await userService.updateUser(updateUserDto, 1);

      expect(result).toEqual({
        message: 'User update successfully.',
        user: updateUser,
      });
    });
  });
});
