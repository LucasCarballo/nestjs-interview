import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateListItemDto } from './dtos/create-list-item';
import { UpdateListItemDto } from './dtos/update-list-item';
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

  async create(
    todoListId: number,
    dto: CreateListItemDto,
  ): Promise<ListItem> {
    const list = await this.todoListRepository.findOne({
      where: { id: todoListId },
    });
    if (!list) {
      throw new NotFoundException(`Todo list ${todoListId} not found`);
    }
    const item = this.listItemRepository.create({ ...dto, todoListId });
    return await this.listItemRepository.save(item);
  }

  async update(
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
    const item = await this.listItemRepository.findOne({
      where: { id, todoListId },
    });
    if (!item) {
      throw new NotFoundException(
        `List item ${id} not found in todo list ${todoListId}`,
      );
    }
    return item;
  }

  async delete(todoListId: number, id: number): Promise<void> {
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

  async markAllDone(todoListId: number): Promise<void> {
    // Bulk UPDATE — one round trip no matter how many items the list has.
    const { affected } = await this.listItemRepository.update(
      { todoListId },
      { done: true },
    );
    if (!affected) {
      throw new NotFoundException(`Todo list ${todoListId} not found`);
    }
  }
}
