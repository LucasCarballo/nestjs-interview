import { Module } from '@nestjs/common';
import { TodoListsController } from './todo_lists.controller';
import { TodoListsService } from './todo_lists.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TodoList } from './todo_list.entity';
import { ListItem } from '../list_items/list_item.entity';
import { TodoListOwnershipGuard } from '../auth/ownership.guard';

@Module({
  imports: [TypeOrmModule.forFeature([TodoList, ListItem])],
  controllers: [TodoListsController],
  providers: [TodoListsService, TodoListOwnershipGuard],
  exports: [TodoListsService],
})
export class TodoListsModule {}
