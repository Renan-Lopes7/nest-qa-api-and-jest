import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { AnswersService } from './answers.service';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { UpdateAnswerDto } from './dto/update-answer.dto';
import { AuthGuard } from '../auth/auth.guard';
import { Request } from 'express';
import { PaginationDto } from '../common/dto/pagination.dto';

interface AuthRequest extends Request {
  user: { sub: number };
}

@Controller('answers')
export class AnswersController {
  constructor(private readonly answersService: AnswersService) {}

  @Post(':questionId')
  @UseGuards(AuthGuard)
  create(
    @Body() createAnswerDto: CreateAnswerDto,
    @Req() req: AuthRequest,
    @Param('questionId', ParseIntPipe) questionId: number,
  ) {
    return this.answersService.create(
      createAnswerDto,
      req.user.sub,
      questionId,
    );
  }

  @UseGuards(AuthGuard)
  @Get()
  findAll(@Query() pagination: PaginationDto) {
    return this.answersService.findAll(pagination);
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.answersService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAnswerDto: UpdateAnswerDto,
    @Req() req: AuthRequest,
  ) {
    return this.answersService.update(id, updateAnswerDto, req.user.sub);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: AuthRequest) {
    return this.answersService.remove(id, req.user.sub);
  }
}
