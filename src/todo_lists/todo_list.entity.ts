import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

// ponytail: items live behind the paginated endpoint, not on the entity.
// Keeping the entity "items-free" makes it impossible to accidentally
// eager-load them via `relations: ['items']` — which would defeat the cap.
// Cascade-delete still works: ListItem.todoList has `onDelete: 'CASCADE'`
// and the FK in the DB enforces it.
@Entity()
export class TodoList {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Shopping List' })
  @Column()
  name: string;
}
