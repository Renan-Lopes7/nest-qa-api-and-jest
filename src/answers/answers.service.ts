import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { UpdateAnswerDto } from './dto/update-answer.dto';
import { PrismaService } from '../database/prisma.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class AnswersService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  private async invalidateQuestionsCache() {
    const keys = await this.redisService.keys('answers:page:*');
    if (keys.length > 0) {
      await this.redisService.del(...keys);
    }
  }
  async create(
    createAnswerDto: CreateAnswerDto,
    userId: number,
    questionId: number,
  ) {
    await this.invalidateQuestionsCache();

    return this.prismaService.answers.create({
      data: {
        body: createAnswerDto.body,
        userId,
        questionId,
      },
    });
  }

  async findAll({ page = 1, limit = 10 }: PaginationDto) {
    const cacheKey = `answers:page:${page}:limit:${limit}`;

    const cache = await this.redisService.get(cacheKey);
    if (cache) {
      return JSON.parse(cache);
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      await this.prismaService.answers.findMany({
        skip,
        take: limit,
        include: { question: true },
      }),
      await this.prismaService.answers.count(),
    ]);
    const result = {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
    await this.redisService.set(cacheKey, JSON.stringify(result), 'EX', 60);

    return result;
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

    await this.invalidateQuestionsCache();

    return {
      message: 'Removed with success',
    };
  }
}
