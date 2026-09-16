import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTodoListDto {
  @ApiProperty({ example: 'Shopping List' })
  @IsString()
  @IsNotEmpty()
  name: string;
}