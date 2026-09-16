import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateListItemDto {
  @ApiProperty({ example: 'Buy oat milk', required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  value?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  done?: boolean;
}