import { ApiProperty } from '@nestjs/swagger';

export class TodoListSummaryDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Shopping List' })
  name: string;

  @ApiProperty({
    example: 47,
    description: 'Total items in the todo list',
  })
  totalItems: number;

  @ApiProperty({
    example: 12,
    description: 'Items in the todo list that are checked off',
  })
  doneItems: number;
}

export class PaginatedTodoListsResponseDto {
  @ApiProperty({ type: [TodoListSummaryDto] })
  items: TodoListSummaryDto[];

  @ApiProperty({ example: 73, description: 'Total todo lists' })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 50 })
  pageSize: number;

  @ApiProperty({
    example: 2,
    description: 'Total pages (Math.ceil(total / pageSize))',
  })
  totalPages: number;
}
