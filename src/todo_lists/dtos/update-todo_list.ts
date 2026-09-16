import { ApiProperty } from '@nestjs/swagger';

export class UpdateTodoListDto {
  @ApiProperty({ example: 'Shopping List' })
  name: string;
}
