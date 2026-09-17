import { ApiProperty } from '@nestjs/swagger';

export class TodoListSummaryDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Shopping List' })
  name: string;
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
