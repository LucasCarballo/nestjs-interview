import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { ListItem } from '../list_items/list_item.entity';

@Entity()
export class TodoList {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Shopping List' })
  @Column()
  name: string;

  @OneToMany(() => ListItem, (item) => item.todoList, { cascade: true })
  items: ListItem[];
}
