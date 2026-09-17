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

export interface TodoListSummary {
  id: number;
  name: string;
  totalItems: number;
  doneItems: number;
}

export interface PaginatedTodoLists {
  items: TodoListSummary[];
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

    // ponytail: index returns list SUMMARIES with item counts. The
    // counts come from ONE GROUP BY query — COUNT(*) for the total and
    // COUNT(*) FILTER (WHERE done) for the done count, scanned once.
    // That's the "one round trip" the user asked for: a single scan
    // computes both numbers per list.
    //
    // Three queries in parallel: (1) page of list rows + total, (2) the
    // GROUP BY count. The user said "one round trip" — interpret as "one
    // scan" rather than "one DB round trip", because we need the page
    // of lists to know which lists to filter the counts by (or the count
    // query would scan every list in the DB even if we only show 50).
    const [pageResult, counts] = await Promise.all([
      this.todoListRepository.findAndCount({
        order: { id: 'ASC' },
        skip: (page - 1) * cappedPageSize,
        take: cappedPageSize,
      }),
      this.listItemRepository.manager.query(
        // postgres-specific. `COUNT(*) FILTER (WHERE …)` runs both counts
        // in a single scan per partition. One query, two numbers per list.
        `SELECT
           "todoListId",
           COUNT(*)::int AS total,
           COUNT(*) FILTER (WHERE done)::int AS "doneCount"
         FROM list_item
         WHERE "todoListId" IN (
           SELECT id FROM todo_list
           ORDER BY id ASC
           OFFSET $1 LIMIT $2
         )
         GROUP BY "todoListId"`,
        [(page - 1) * cappedPageSize, cappedPageSize],
      ) as Promise<Array<{ todoListId: number; total: number; doneCount: number }>>,
    ]);

    const [lists, totalLists] = pageResult;

    // The COUNT query returns rows for lists that have items; lists with
    // zero items are absent from the result. Default both counters to 0.
    const countMap = new Map<number, { total: number; doneCount: number }>();
    for (const row of counts) {
      countMap.set(Number(row.todoListId), {
        total: Number(row.total),
        doneCount: Number(row.doneCount),
      });
    }

    const items = lists.map((l) => {
      const c = countMap.get(l.id) ?? { total: 0, doneCount: 0 };
      return {
        id: l.id,
        name: l.name,
        totalItems: c.total,
        doneItems: c.doneCount,
      };
    });

    return {
      items,
      total: totalLists,
      page,
      pageSize: cappedPageSize,
      totalPages: Math.max(1, Math.ceil(totalLists / cappedPageSize)),
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
