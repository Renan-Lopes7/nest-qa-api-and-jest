import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Req,
  ValidationPipe,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '../auth/auth.guard';
import type { AuthRequest } from '../auth/interfaces/auth.request';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('signup')
  signupUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.signup(createUserDto);
  }

  @Get()
  findAllUsers(@Query() pagination: PaginationDto) {
    return this.userService.findAllUsers(pagination);
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  getUser(@Param('id', ParseIntPipe) id: number) {
    return this.userService.getUser(id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  updateUser(
    @Body() updateUserDto: UpdateUserDto,
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthRequest,
  ) {
    return this.userService.updateUser(updateUserDto, id, req.user.sub);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number, @Req() req: AuthRequest) {
    return this.userService.deleteUser(id, req.user.sub);
  }
}
