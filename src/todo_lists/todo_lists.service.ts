import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTodoListDto } from './dtos/create-todo_list';
import { UpdateTodoListDto } from './dtos/update-todo_list';
import { TodoList } from './todo_list.entity';

@Injectable()
export class TodoListsService {
  constructor(
    @InjectRepository(TodoList)
    private readonly todoListRepository: Repository<TodoList>,
  ) {}

  async all(): Promise<TodoList[]> {
    return await this.todoListRepository.find({ relations: ['items'] });
  }

  async get(id: number): Promise<TodoList> {
    const todoList = await this.todoListRepository.findOne({
      where: { id },
      relations: ['items'],
    });
    if (!todoList) {
      throw new NotFoundException(`Todo list ${id} not found`);
    }
    return todoList;
  }

  async create(dto: CreateTodoListDto): Promise<TodoList> {
    const todoList = this.todoListRepository.create({ name: dto.name });
    const saved = await this.todoListRepository.save(todoList);
    // newly created lists have no items; return the same shape as get()
    return { ...saved, items: [] };
  }

  async update(id: number, dto: UpdateTodoListDto): Promise<TodoList> {
    const { affected } = await this.todoListRepository.update(id, dto);
    if (!affected) {
      throw new NotFoundException(`Todo list ${id} not found`);
    }
    return this.get(id);
  }

  async delete(id: number): Promise<void> {
    const { affected } = await this.todoListRepository.delete(id);
    if (!affected) {
      throw new NotFoundException(`Todo list ${id} not found`);
    }
  }
}
