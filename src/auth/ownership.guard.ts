import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TodoList } from '../todo_lists/todo_list.entity';
import { ListItem } from '../list_items/list_item.entity';

// Owns the parent-list check. Needs only the TodoList repo.
// Lives in TodoListsModule — that's where the repo is registered.
@Injectable()
export class TodoListOwnershipGuard implements CanActivate {
  constructor(
    @InjectRepository(TodoList)
    private readonly todoListRepo: Repository<TodoList>,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const todoListId = Number(req.params.todoListId);
    if (!todoListId) {
      throw new NotFoundException('Missing todoListId');
    }
    const list = await this.todoListRepo.findOneBy({ id: todoListId });
    if (!list) {
      throw new NotFoundException(`Todo list ${todoListId} not found`);
    }
    return true;
  }
}

// Owns the per-item check. Needs both repos: the parent list and the item
// itself. Lives in ListItemsModule where both repos are registered.
@Injectable()
export class ListItemOwnershipGuard implements CanActivate {
  constructor(
    @InjectRepository(TodoList)
    private readonly todoListRepo: Repository<TodoList>,
    @InjectRepository(ListItem)
    private readonly listItemRepo: Repository<ListItem>,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const params = ctx.switchToHttp().getRequest().params as Record<
      string,
      string
    >;
    const todoListId = Number(params.todoListId);
    const itemId = Number(params.itemId ?? params.listItemId);
    if (!todoListId || !itemId) {
      throw new NotFoundException('Missing todoListId or itemId');
    }
    const list = await this.todoListRepo.findOneBy({ id: todoListId });
    if (!list) {
      throw new NotFoundException(`Todo list ${todoListId} not found`);
    }
    const item = await this.listItemRepo.findOneBy({
      id: itemId,
      todoListId,
    });
    if (!item) {
      throw new NotFoundException(`List item ${itemId} not found`);
    }
    return true;
  }
}
