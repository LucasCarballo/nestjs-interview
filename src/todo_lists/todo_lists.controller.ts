import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateTodoListDto } from './dtos/create-todo_list';
import { UpdateTodoListDto } from './dtos/update-todo_list';
import { TodoList } from '../interfaces/todo_list.interface';
import { TodoListsService } from './todo_lists.service';

@ApiTags('todo-lists')
@Controller('api/todolists')
export class TodoListsController {
  constructor(private todoListsService: TodoListsService) {}

  @ApiOperation({ summary: 'List all todo lists' })
  @Get()
  index(): Promise<TodoList[]> {
    return this.todoListsService.all();
  }

  @ApiOperation({ summary: 'Get a todo list by id' })
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
  @Put('/:todoListId')
  update(
    @Param() param: { todoListId: string },
    @Body() dto: UpdateTodoListDto,
  ): Promise<TodoList> {
    return this.todoListsService.update(Number(param.todoListId), dto);
  }

  @ApiOperation({ summary: 'Delete a todo list' })
  @Delete('/:todoListId')
  delete(@Param() param: { todoListId: number }): Promise<void> {
    return this.todoListsService.delete(param.todoListId);
  }
}
