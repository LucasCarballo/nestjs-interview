import { ApiProperty } from '@nestjs/swagger';
import { ListItemResponseDto } from '../../list_items/dtos/list-item-response.dto';

export class PaginatedListItemsResponseDto {
  @ApiProperty({ type: [ListItemResponseDto] })
  items: ListItemResponseDto[];

  @ApiProperty({ example: 47, description: 'Total items in the todo list' })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 50 })
  pageSize: number;

  @ApiProperty({
    example: 4,
    description: 'Total number of pages (Math.ceil(total / pageSize))',
  })
  totalPages: number;
}
