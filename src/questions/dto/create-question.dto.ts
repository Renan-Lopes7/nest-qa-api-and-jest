import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateQuestionDto {
  @IsNotEmpty({ message: 'Title is required' })
  @IsString({ message: 'Title must be string' })
  title: string;

  @IsNotEmpty({ message: 'Body is required' })
  @IsString({ message: 'Body must be string' })
  body: string;
}
