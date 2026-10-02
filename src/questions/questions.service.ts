import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { PrismaService } from '../database/prisma.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class QuestionsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  private async invalidateQuestionsCache() {
    const keys = await this.redisService.keys('questions:page:*');
    if (keys.length > 0) {
      await this.redisService.del(...keys);
    }
  }

  async create(createQuestionDto: CreateQuestionDto, userId: number) {
    await this.invalidateQuestionsCache();

    return this.prismaService.questions.create({
      data: { ...createQuestionDto, userId },
    });
  }

  async findAll({ page = 1, limit = 10 }: PaginationDto) {
    const cacheKey = `questions:page:${page}:limit:${limit}`;

    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      await this.prismaService.questions.findMany({
        skip,
        take: limit,
        include: {
          user: { select: { name: true } },
          answers: true,
        },
      }),
      await this.prismaService.questions.count(),
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

  findOne(id: number) {
    return this.prismaService.questions.findUnique({
      where: { id },
      include: {
        user: {
          select: { name: true, email: true },
        },
        answers: {
          include: {
            user: {
              select: { name: true, email: true },
            },
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

    await this.invalidateQuestionsCache();

    return {
      message: 'Question deleted',
    };
  }
}
