import { ApiProperty } from '@nestjs/swagger';

export class CreateListItemDto {
  @ApiProperty({ example: 'Buy milk' })
  value: string;
}
