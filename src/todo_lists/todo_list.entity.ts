import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ListItem } from '../list_items/list_item.entity';
import { User } from '../users/user.entity';

@Entity()
export class TodoList {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Shopping List' })
  @Column()
  name: string;

  @ApiProperty({ example: 1 })
  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.lists, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => ListItem, (item) => item.todoList, { cascade: true })
  items: ListItem[];
}
