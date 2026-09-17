import { ApiProperty } from '@nestjs/swagger';

export class ListItemResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Buy milk' })
  value: string;

  @ApiProperty({ example: false, description: 'Whether the item is checked off' })
  done: boolean;

  @ApiProperty({ example: 1, description: 'Id of the parent todo list' })
  todoListId: number;
}
