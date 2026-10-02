import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { AuthGuard } from '../auth/auth.guard';
import { Request } from 'express';
import { PaginationDto } from '../common/dto/pagination.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

interface AuthRequest extends Request {
  user: { sub: number };
}

@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  create(
    @Body() createQuestionDto: CreateQuestionDto,
    @Req() req: AuthRequest,
  ) {
    return this.questionsService.create(createQuestionDto, req.user.sub);
  }

  @Get()
  findAll(@Query() pagination: PaginationDto) {
    return this.questionsService.findAll(pagination);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.questionsService.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateQuestionDto: UpdateQuestionDto,
    @Req() req: AuthRequest,
  ) {
    return this.questionsService.update(id, updateQuestionDto, req.user.sub);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: AuthRequest) {
    return this.questionsService.remove(id, req.user.sub);
  }
}
