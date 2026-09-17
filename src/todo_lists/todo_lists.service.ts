import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTodoListDto } from './dtos/create-todo_list';
import { UpdateTodoListDto } from './dtos/update-todo_list';
import { TodoList } from './todo_list.entity';
import { ListItem } from '../list_items/list_item.entity';
import {
  ITEMS_IN_PARENT_LIMIT,
  LISTS_IN_INDEX_LIMIT,
} from './dtos/todo-list-response.dto';

export interface TodoListWithMeta {
  id: number;
  name: string;
  items: ListItem[];
  totalItems: number;
  itemsTruncated: boolean;
}

export interface PaginatedTodoLists {
  items: TodoListWithMeta[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

@Injectable()
export class TodoListsService {
  constructor(
    @InjectRepository(TodoList)
    private readonly todoListRepository: Repository<TodoList>,
    @InjectRepository(ListItem)
    private readonly listItemRepository: Repository<ListItem>,
  ) {}

  // Single SELECT with LIMIT — capped slice comes from the DB, not from JS
  // over a full list. Safe for huge lists.
  private async fetchCappedItems(
    todoListId: number,
  ): Promise<{ items: ListItem[]; total: number }> {
    const [items, total] = await this.listItemRepository.findAndCount({
      where: { todoListId },
      order: { id: 'ASC' },
      take: ITEMS_IN_PARENT_LIMIT,
    });
    return { items, total };
  }

  private decorate(
    list: TodoList,
    items: ListItem[],
    totalItems: number,
  ): TodoListWithMeta {
    return {
      id: list.id,
      name: list.name,
      items,
      totalItems,
      itemsTruncated: totalItems > items.length,
    };
  }

  async all(page = 1, pageSize = LISTS_IN_INDEX_LIMIT): Promise<PaginatedTodoLists> {
    // Hard ceiling on pageSize so a single request can't ask for an
    // unbounded number of lists.
    const cappedPageSize = Math.min(pageSize, LISTS_IN_INDEX_LIMIT);

    // ponytail: index returns list SUMMARIES, not items. Items always come
    // from GET /api/todolists/:id (with cap) or GET /:id/items (paginated).
    // Nesting items into every list in the index would be unbounded when
    // lists have thousands of items each — Postgres can't LIMIT per
    // partition in a single SELECT, so we'd either scan all items or
    // ship a giant response. The summary shape stays cheap.
    const [lists, total] = await this.todoListRepository.findAndCount({
      order: { id: 'ASC' },
      skip: (page - 1) * cappedPageSize,
      take: cappedPageSize,
    });
    const items = lists.map((l) => ({
      id: l.id,
      name: l.name,
      items: [],
      totalItems: 0,
      itemsTruncated: false,
    }));
    return {
      items,
      total,
      page,
      pageSize: cappedPageSize,
      totalPages: Math.max(1, Math.ceil(total / cappedPageSize)),
    };
  }

  async get(id: number): Promise<TodoListWithMeta> {
    const list = await this.todoListRepository.findOne({ where: { id } });
    if (!list) {
      throw new NotFoundException(`Todo list ${id} not found`);
    }
    const { items, total } = await this.fetchCappedItems(id);
    return this.decorate(list, items, total);
  }

  async create(dto: CreateTodoListDto): Promise<TodoListWithMeta> {
    const list = this.todoListRepository.create({ name: dto.name });
    const saved = await this.todoListRepository.save(list);
    return this.decorate(saved, [], 0);
  }

  async update(id: number, dto: UpdateTodoListDto): Promise<TodoListWithMeta> {
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
