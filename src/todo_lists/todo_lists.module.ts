import { Module } from '@nestjs/common';
import { TodoListsController } from './todo_lists.controller';
import { TodoListsService } from './todo_lists.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TodoList } from './todo_list.entity';
import { ListItemsModule } from '../list_items/list_items.module';
import { AuthModule } from '../auth/auth.module';
import { User } from '../users/user.entity';
import { ListItem } from '../list_items/list_item.entity';
import {
  TodoListOwnershipGuard,
  ListItemOwnershipGuard,
} from '../auth/ownership.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([TodoList, ListItem, User]),
    ListItemsModule,
    AuthModule,
  ],
  controllers: [TodoListsController],
  providers: [TodoListsService, TodoListOwnershipGuard, ListItemOwnershipGuard],
  exports: [TodoListsService],
})
export class TodoListsModule {}
