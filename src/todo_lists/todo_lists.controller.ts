import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateTodoListDto } from './dtos/create-todo_list';
import { UpdateTodoListDto } from './dtos/update-todo_list';
import { TodoList } from './todo_list.entity';
import { TodoListsService } from './todo_lists.service';
import { TodoListOwnershipGuard } from '../auth/ownership.guard';

@ApiTags('todo-lists')
@Controller('api/todolists')
export class TodoListsController {
  constructor(private todoListsService: TodoListsService) {}

  @ApiOperation({ summary: 'List all todo lists (each with its items)' })
  @Get()
  index(): Promise<TodoList[]> {
    return this.todoListsService.all();
  }

  @ApiOperation({ summary: 'Get one todo list (with its items)' })
  @UseGuards(TodoListOwnershipGuard)
  @Get('/:todoListId')
  show(@Param() param: { todoListId: number }): Promise<TodoList> {
    return this.todoListsService.get(param.todoListId);
  }

  @ApiOperation({ summary: 'Create a todo list' })
  @Post()
  create(@Body() dto: CreateTodoListDto): Promise<TodoList> {
    return this.todoListsService.create(dto);
  }

  @ApiOperation({ summary: 'Update a todo list' })
  @UseGuards(TodoListOwnershipGuard)
  @Put('/:todoListId')
  update(
    @Param() param: { todoListId: string },
    @Body() dto: UpdateTodoListDto,
  ): Promise<TodoList> {
    return this.todoListsService.update(Number(param.todoListId), dto);
  }

  @ApiOperation({ summary: 'Delete a todo list (cascades to items)' })
  @UseGuards(TodoListOwnershipGuard)
  @Delete('/:todoListId')
  delete(@Param() param: { todoListId: number }): Promise<void> {
    return this.todoListsService.delete(param.todoListId);
  }
}
