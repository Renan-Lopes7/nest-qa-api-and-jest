import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../database/prisma.service';
import bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async signup(createUserDto: CreateUserDto) {
    const hashPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = await this.prismaService.user.create({
      data: { ...createUserDto, password: hashPassword },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      message: 'User created with success',
      user,
    };
  }

  async findAllUsers() {
    const users = await this.prismaService.user.findMany({
      omit: { password: true },
    });

    return users;
  }

  async getUser(id: number) {
    const user = await this.prismaService.user.findFirst({
      where: { id: +id },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) throw new NotFoundException('User not found.');

    return user;
  }

  async updateUser(
    updateUserDto: UpdateUserDto,
    id: number,
    requestId: number,
  ) {
    if (id !== requestId) {
      throw new ForbiddenException('You can only edit your omw account');
    }

    const user = await this.prismaService.user.findFirst({
      where: { id: id },
    });
    if (!user) throw new NotFoundException('User not found.');

    const { name, email, password, currentPassword } = updateUserDto;

    if (password) {
      if (!currentPassword) {
        throw new BadRequestException(
          'Enter your current password to change your password',
        );
      }
      const passwordIsValid = await bcrypt.compare(
        currentPassword,
        user.password,
      );
      if (!passwordIsValid) {
        throw new UnauthorizedException('Current password is incorrect');
      }
    }

    const updateUser = await this.prismaService.user.update({
      where: { id: +id },
      data: {
        name,
        email,
        ...(password && { password: await bcrypt.hash(password, 10) }),
      },
      omit: { password: true },
    });

    return {
      message: 'User update successfully.',
      user: updateUser,
    };
  }

  async deleteUser(id: number, requestId: number) {
    if (id !== requestId)
      throw new ForbiddenException(
        'You can´t delete an account that isn´t yours ',
      );

    const user = await this.prismaService.user.findFirst({ where: { id } });
    if (!user) throw new NotFoundException('User not found.');

    if (user.id !== requestId)
      throw new ForbiddenException(
        'You can´t delete an account that isn´t yours ',
      );

    await this.prismaService.user.delete({
      where: { id: user.id },
      select: { id: true, name: true, email: true },
    });

    return {
      message: 'User removed successfully',
    };
  }
}
