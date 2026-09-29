import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class QuestionsService {
  constructor(private readonly prismaService: PrismaService) {}

  create(createQuestionDto: CreateQuestionDto, userId: number) {
    return this.prismaService.questions.create({
      data: { ...createQuestionDto, userId },
    });
  }

  findAll() {
    return this.prismaService.questions.findMany({
      include: {
        answers: true,
      },
    });
  }

  findOne(id: number) {
    return this.prismaService.questions.findUnique({
      where: { id },
      include: {
        answers: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async update(
    id: number,
    updateQuestionDto: UpdateQuestionDto,
    requestId: number,
  ) {
    const questionExist = await this.prismaService.questions.findFirst({
      where: { id },
    });

    if (!questionExist)
      throw new BadRequestException('This question not exist');

    if (questionExist.userId !== requestId)
      throw new ForbiddenException('You can only edit your own question');

    this.prismaService.questions.update({
      where: { id },
      data: updateQuestionDto,
    });

    return {
      message: 'Updated question',
    };
  }

  async remove(id: number, requestId: number) {
    const question = await this.prismaService.questions.delete({
      where: { id },
    });

    if (question.userId !== requestId)
      throw new ForbiddenException('You can only remove your own question');

    return {
      message: 'Question deleted',
    };
  }
}
