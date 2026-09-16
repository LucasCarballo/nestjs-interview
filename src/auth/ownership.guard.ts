import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TodoList } from '../todo_lists/todo_list.entity';
import { ListItem } from '../list_items/list_item.entity';

export type ResourceKind = 'list' | 'item';

function makeGuard(kind: ResourceKind) {
  @Injectable()
  class OwnershipGuard implements CanActivate {
    constructor(
      @InjectRepository(TodoList)
      readonly todoListRepo: Repository<TodoList>,
      @InjectRepository(ListItem)
      readonly listItemRepo: Repository<ListItem>,
    ) {}

    async canActivate(ctx: ExecutionContext): Promise<boolean> {
      const req = ctx.switchToHttp().getRequest();
      const userId = req.user?.userId;
      if (!userId) {
        throw new ForbiddenException('Not authenticated');
      }
      const params = req.params as Record<string, string>;

      if (kind === 'list') {
        const todoListId = Number(params.todoListId);
        if (!todoListId) {
          throw new NotFoundException('Missing todoListId');
        }
        const list = await this.todoListRepo.findOneBy({ id: todoListId });
        if (!list) {
          throw new NotFoundException(`Todo list ${todoListId} not found`);
        }
        if (list.userId !== userId) {
          throw new ForbiddenException('You do not own this todo list');
        }
        return true;
      }

      // item: parent list must be owned by the user
      const todoListId = Number(params.todoListId);
      const listItemId = Number(params.listItemId);
      if (!todoListId || !listItemId) {
        throw new NotFoundException('Missing todoListId or listItemId');
      }
      const list = await this.todoListRepo.findOneBy({ id: todoListId });
      // Don't leak existence to non-owners: missing list OR wrong owner -> 404
      if (!list || list.userId !== userId) {
        throw new NotFoundException(`Todo list ${todoListId} not found`);
      }
      const item = await this.listItemRepo.findOneBy({
        id: listItemId,
        todoListId,
      });
      if (!item) {
        throw new NotFoundException(`List item ${listItemId} not found`);
      }
      return true;
    }
  }
  return OwnershipGuard;
}

export const TodoListOwnershipGuard = makeGuard('list');
export const ListItemOwnershipGuard = makeGuard('item');
