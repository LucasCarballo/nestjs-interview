import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateListItemDto {
  @ApiProperty({ example: 'Buy oat milk' })
  @IsString()
  @IsNotEmpty()
  value: string;
}