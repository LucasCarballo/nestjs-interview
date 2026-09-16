import { Injectable } from '@nestjs/common';
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

  async get(todoListId: number, id: number): Promise<ListItem | null> {
    return await this.listItemRepository.findOneBy({ id, todoListId });
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
    return await this.listItemRepository.save({
      id,
      todoListId,
      ...dto,
    } as ListItem);
}

  async delete(todoListId: number, id: number): Promise<void> {
    await this.listItemRepository.delete({ id, todoListId });
  }
}
