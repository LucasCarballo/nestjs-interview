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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateTodoListDto } from './dtos/create-todo_list';
import { UpdateTodoListDto } from './dtos/update-todo_list';
import { TodoList } from './todo_list.entity';
import { TodoListsService } from './todo_lists.service';
import { ListItemsService } from '../list_items/list_items.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TodoListOwnershipGuard } from '../auth/ownership.guard';
import { AuthUser, CurrentUser } from '../auth/current-user.decorator';

@ApiTags('todo-lists')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/todolists')
export class TodoListsController {
  constructor(
    private todoListsService: TodoListsService,
    private listItemsService: ListItemsService,
  ) {}

  // No :todoListId in this route — JWT-only is enough, but service still filters by userId.
  @ApiOperation({ summary: 'List all of my todo lists' })
  @Get()
  index(@CurrentUser() user: AuthUser): Promise<TodoList[]> {
    return this.todoListsService.all(user.userId);
  }

  @ApiOperation({ summary: 'Get one of my todo lists' })
  @UseGuards(TodoListOwnershipGuard) // needs :todoListId
  @Get('/:todoListId')
  show(
    @CurrentUser() user: AuthUser,
    @Param() param: { todoListId: number },
  ): Promise<TodoList> {
    return this.todoListsService.get(user.userId, param.todoListId);
  }

  @ApiOperation({ summary: 'Create a todo list owned by me' })
  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateTodoListDto,
  ): Promise<TodoList> {
    return this.todoListsService.create(user.userId, dto);
  }

  @ApiOperation({ summary: 'Update one of my todo lists' })
  @UseGuards(TodoListOwnershipGuard)
  @Put('/:todoListId')
  update(
    @CurrentUser() user: AuthUser,
    @Param() param: { todoListId: string },
    @Body() dto: UpdateTodoListDto,
  ): Promise<TodoList> {
    return this.todoListsService.update(
      user.userId,
      Number(param.todoListId),
      dto,
    );
  }

  @ApiOperation({ summary: 'Mark all items of one of my todo lists as done' })
  @UseGuards(TodoListOwnershipGuard)
  @Put('/:todoListId/done')
  markDone(
    @CurrentUser() user: AuthUser,
    @Param() param: { todoListId: number },
  ): Promise<void> {
    return this.listItemsService.markAllDone(user.userId, param.todoListId);
  }

  @ApiOperation({ summary: 'Delete one of my todo lists' })
  @UseGuards(TodoListOwnershipGuard)
  @Delete('/:todoListId')
  delete(
    @CurrentUser() user: AuthUser,
    @Param() param: { todoListId: number },
  ): Promise<void> {
    return this.todoListsService.delete(user.userId, param.todoListId);
  }
}
