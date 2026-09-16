import { Module } from '@nestjs/common';
import { TodoListsController } from './todo_lists.controller';
import { TodoListsService } from './todo_lists.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TodoList } from './todo_list.entity';
import { TodoListOwnershipGuard } from '../auth/ownership.guard';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([TodoList]), AuthModule],
  controllers: [TodoListsController],
  providers: [TodoListsService, TodoListOwnershipGuard],
  exports: [TodoListsService],
})
export class TodoListsModule {}
