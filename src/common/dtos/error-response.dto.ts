import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({ example: 'Bad Request' })
  error: string;

  @ApiProperty({
    oneOf: [
      { type: 'string', example: 'Todo list 999 not found' },
      { type: 'array', items: { type: 'string' }, example: ['name should not be empty'] },
    ],
    description: 'Either a single message or an array of validation messages',
  })
  message: string | string[];

  @ApiProperty({ example: '2026-09-16T12:34:56.789Z', required: false })
  timestamp?: string;

  @ApiProperty({ example: '/api/todolists/999', required: false })
  path?: string;
}
