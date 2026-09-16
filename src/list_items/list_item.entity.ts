import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TodoList } from '../todo_lists/todo_list.entity';

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

  @ManyToOne(() => TodoList, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'todoListId' })
  todoList: TodoList;
}
