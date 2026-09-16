import { ApiProperty } from '@nestjs/swagger';

export class CreateTodoListDto {
  @ApiProperty({ example: 'Shopping List' })
  name: string;
}
