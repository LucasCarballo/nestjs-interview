import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateListItemDto } from './dtos/create-list-item';
import { UpdateListItemDto } from './dtos/update-list-item';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ListItem } from './list_item.entity';
import { TodoList } from '../todo_lists/todo_list.entity';

@Injectable()
export class ListItemsService {
  constructor(
    @InjectRepository(ListItem)
    private readonly listItemRepository: Repository<ListItem>,
    @InjectRepository(TodoList)
    private readonly todoListRepository: Repository<TodoList>,
  ) {}

  async all(userId: number, todoListId: number): Promise<ListItem[]> {
    return await this.listItemRepository.find({
      where: { todoListId, todoList: { userId } },
    });
  }

  async get(
    userId: number,
    todoListId: number,
    id: number,
  ): Promise<ListItem> {
    const item = await this.listItemRepository.findOne({
      where: { id, todoListId, todoList: { userId } },
    });
    if (!item) {
      throw new NotFoundException(
        `List item ${id} not found in todo list ${todoListId}`,
      );
    }
    return item;
  }

  async create(
    userId: number,
    todoListId: number,
    dto: CreateListItemDto,
  ): Promise<ListItem> {
    const list = await this.todoListRepository.findOne({
      where: { id: todoListId, userId },
    });
    if (!list) {
      throw new NotFoundException(`Todo list ${todoListId} not found`);
    }
    const item = this.listItemRepository.create({ ...dto, todoListId });
    return await this.listItemRepository.save(item);
  }

  async update(
    userId: number,
    todoListId: number,
    id: number,
    dto: UpdateListItemDto,
  ): Promise<ListItem> {
    const { affected } = await this.listItemRepository.update(
      { id, todoListId },
      dto,
    );
    if (!affected) {
      throw new NotFoundException(
        `List item ${id} not found in todo list ${todoListId}`,
      );
    }
    return this.get(userId, todoListId, id);
  }

  async delete(
    userId: number,
    todoListId: number,
    id: number,
  ): Promise<void> {
    const { affected } = await this.listItemRepository.delete({
      id,
      todoListId,
    });
    if (!affected) {
      throw new NotFoundException(
        `List item ${id} not found in todo list ${todoListId}`,
      );
    }
  }

  async markAllDone(userId: number, todoListId: number): Promise<void> {
    const { affected } = await this.listItemRepository.update(
      { todoListId },
      { done: true },
    );
    if (!affected) {
      throw new NotFoundException(`Todo list ${todoListId} not found`);
    }
  }
}
