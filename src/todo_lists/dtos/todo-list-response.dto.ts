import { ApiProperty } from '@nestjs/swagger';
import { ListItemResponseDto } from '../../list_items/dtos/list-item-response.dto';

// ponytail: ITEMS_IN_PARENT_LIMIT controls how many items ride along on the
// parent GET. When a list has more than this, the parent response sets
// `itemsTruncated: true` and `totalItems: N` so the client can fetch the
// remainder from the paginated endpoint.
export const ITEMS_IN_PARENT_LIMIT = 20;

// ponytail: LISTS_IN_INDEX_LIMIT caps the index page at this many lists.
// Combined with ITEMS_IN_PARENT_LIMIT, the worst-case response size is
// LISTS_IN_INDEX_LIMIT × ITEMS_IN_PARENT_LIMIT = 1000 items.
export const LISTS_IN_INDEX_LIMIT = 50;

export class TodoListResponseDto {
  @ApiProperty({ example: 1, description: 'Auto-generated todo list id' })
  id: number;

  @ApiProperty({ example: 'Shopping List' })
  name: string;

  @ApiProperty({
    type: () => [ListItemResponseDto],
    description: `Up to ${ITEMS_IN_PARENT_LIMIT} items from this list (first ${ITEMS_IN_PARENT_LIMIT} by id ASC).`,
  })
  items: ListItemResponseDto[];

  @ApiProperty({
    example: 47,
    description: 'Total items in the todo list (independent of the cap)',
  })
  totalItems: number;

  @ApiProperty({
    example: false,
    description:
      'True when items[] was truncated to the cap. Fetch the rest from the paginated items endpoint.',
  })
  itemsTruncated: boolean;
}
