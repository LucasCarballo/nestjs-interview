import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTodoListDto } from './dtos/create-todo_list';
import { UpdateTodoListDto } from './dtos/update-todo_list';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TodoList } from './todo_list.entity';

@Injectable()
export class TodoListsService {
  constructor(
    @InjectRepository(TodoList)
    private readonly todoListRepository: Repository<TodoList>,
  ) {}

  // every read/write is scoped to a user — defense in depth on top of the guard
  private ownedWhere(userId: number) {
    return { userId } as const;
  }

  async all(userId: number): Promise<TodoList[]> {
    return await this.todoListRepository.find({
      where: this.ownedWhere(userId),
    });
  }

  async get(userId: number, id: number): Promise<TodoList> {
    const todoList = await this.todoListRepository.findOne({
      where: { id, userId },
    });
    if (!todoList) {
      throw new NotFoundException(`Todo list ${id} not found`);
    }
    return todoList;
  }

  async create(
    userId: number,
    dto: CreateTodoListDto,
  ): Promise<TodoList> {
    const todoList = this.todoListRepository.create({
      name: dto.name,
      userId,
    });
    return await this.todoListRepository.save(todoList);
  }

  async update(
    userId: number,
    id: number,
    dto: UpdateTodoListDto,
  ): Promise<TodoList> {
    const { affected } = await this.todoListRepository.update(
      { id, userId },
      dto,
    );
    if (!affected) {
      throw new NotFoundException(`Todo list ${id} not found`);
    }
    return this.get(userId, id);
  }

  async delete(userId: number, id: number): Promise<void> {
    const { affected } = await this.todoListRepository.delete({
      id,
      userId,
    });
    if (!affected) {
      throw new NotFoundException(`Todo list ${id} not found`);
    }
  }
}
