import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateListItemDto } from './dtos/create-list-item';
import { UpdateListItemDto } from './dtos/update-list-item';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ListItem } from './list_item.entity';

@Injectable()
export class ListItemsService {
  constructor(
    @InjectRepository(ListItem)
    private readonly listItemRepository: Repository<ListItem>,
  ) {}

  async all(todoListId: number): Promise<ListItem[]> {
    return await this.listItemRepository.find({ where: { todoListId } });
  }

  async get(todoListId: number, id: number): Promise<ListItem> {
    const item = await this.listItemRepository.findOneBy({ id, todoListId });
    if (!item) {
      throw new NotFoundException(
        `List item ${id} not found in todo list ${todoListId}`,
      );
    }
    return item;
  }

  async create(todoListId: number, dto: CreateListItemDto): Promise<ListItem> {
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
    return this.get(todoListId, id);
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
}
