import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ListItem {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Buy milk' })
  @Column()
  value: string;

  @ApiProperty({ example: 1 })
  @Column()
  todoListId: number;
}
