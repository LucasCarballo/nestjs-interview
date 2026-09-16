import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { TodoList } from '../todo_lists/todo_list.entity';

@Entity('users')
export class User {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'ada@example.com' })
  @Column({ unique: true })
  email: string;

  // bcrypt hash; never returned via the DTO/serializer
  @Column()
  passwordHash: string;

  @OneToMany(() => TodoList, (list) => list.user)
  lists: TodoList[];
}
