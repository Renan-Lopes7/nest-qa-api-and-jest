import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { UpdateAnswerDto } from './dto/update-answer.dto';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class AnswersService {
  constructor(private readonly prismaService: PrismaService) {}
  create(createAnswerDto: CreateAnswerDto, userId: number, questionId: number) {
    return this.prismaService.answers.create({
      data: {
        body: createAnswerDto.body,
        userId,
        questionId,
      },
    });
  }

  findAll() {
    return this.prismaService.answers.findMany();
  }

  async findOne(id: number) {
    const answerExist = await this.prismaService.answers.findFirst({
      where: { id },
    });
    if (!answerExist) throw new NotFoundException('Answer not found');

    return answerExist;
  }

  async update(
    id: number,
    updateAnswerDto: UpdateAnswerDto,
    requestId: number,
  ) {
    const ifAnswerExist = await this.prismaService.answers.findFirst({
      where: { id },
    });
    if (!ifAnswerExist) throw new NotFoundException('Answer not found');

    if (ifAnswerExist.userId !== requestId)
      throw new ForbiddenException('You can only edit your own answer');

    const updateAnswer = await this.prismaService.answers.update({
      where: { id },
      data: updateAnswerDto,
    });

    return {
      message: 'Updated answer',
      updateAnswer,
    };
  }

  async remove(id: number, requestId: number) {
    const ifAnswerExist = await this.prismaService.answers.findFirst({
      where: { id },
    });
    if (!ifAnswerExist) throw new NotFoundException('Answer not found');

    if (ifAnswerExist.userId !== requestId)
      throw new ForbiddenException('You can only delete your own answer');

    await this.prismaService.answers.delete({
      where: { id },
    });

    return {
      message: 'Removed with success',
    };
  }
}
