import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ListItem } from './list_item.entity';
import { TodoList } from '../todo_lists/todo_list.entity';
import { ListItemsService } from './list_items.service';
import { ListItemsController } from './list_items.controller';
import {
  TodoListOwnershipGuard,
  ListItemOwnershipGuard,
} from '../auth/ownership.guard';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([ListItem, TodoList]), AuthModule],
  controllers: [ListItemsController],
  providers: [ListItemsService, TodoListOwnershipGuard, ListItemOwnershipGuard],
  exports: [ListItemsService],
})
export class ListItemsModule {}
