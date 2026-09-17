import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { LISTS_IN_INDEX_LIMIT } from './todo-list-response.dto';

export class TodoListsPaginationQueryDto {
  @ApiProperty({
    example: 1,
    description: '1-indexed page number',
    required: false,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiProperty({
    example: 50,
    description: `Lists per page (max ${LISTS_IN_INDEX_LIMIT})`,
    required: false,
    default: 50,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(LISTS_IN_INDEX_LIMIT)
  pageSize: number = LISTS_IN_INDEX_LIMIT;
}
