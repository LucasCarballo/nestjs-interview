import { ApiProperty } from '@nestjs/swagger';

export class UpdateListItemDto {
  @ApiProperty({ example: 'Buy oat milk' })
  value: string;
}
