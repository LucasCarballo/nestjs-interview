import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateTodoListDto {
  @ApiProperty({ example: 'Shopping List' })
  @IsString()
  @IsNotEmpty()
  name: string;
}