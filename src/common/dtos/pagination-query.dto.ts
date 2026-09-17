import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

// ponytail: ITEMS_PAGE_SIZE_MAX caps items per page for the paginated
// items endpoint. Separate from LISTS_PAGE_SIZE_MAX in paginated-todo-lists
// — the items endpoint can serve a deeper page (200) than the lists index
// (50) because the lists index response carries items nested inside.
export const ITEMS_PAGE_SIZE_MAX = 200;

export class PaginationQueryDto {
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
    description: `Items per page (max ${ITEMS_PAGE_SIZE_MAX})`,
    required: false,
    default: 50,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(ITEMS_PAGE_SIZE_MAX)
  pageSize: number = 50;
}
