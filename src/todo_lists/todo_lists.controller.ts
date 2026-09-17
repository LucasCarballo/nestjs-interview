import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateTodoListDto } from './dtos/create-todo_list';
import { UpdateTodoListDto } from './dtos/update-todo_list';
import { TodoListResponseDto } from './dtos/todo-list-response.dto';
import { PaginatedTodoListsResponseDto } from './dtos/paginated-todo-lists-response.dto';
import { TodoListsPaginationQueryDto } from './dtos/todo-lists-pagination-query.dto';
import { ErrorResponseDto } from '../common/dtos/error-response.dto';
import { TodoListsService } from './todo_lists.service';
import { TodoListOwnershipGuard } from '../auth/ownership.guard';

@ApiTags('todo-lists')
@Controller('api/todolists')
export class TodoListsController {
  constructor(private todoListsService: TodoListsService) {}

  @ApiOperation({
    summary: 'List todo lists (paginated, summary only)',
    description:
      'Returns a page of todo lists as summaries (id + name). ' +
      'Items live on GET /api/todolists/:id (capped at 20) and ' +
      'GET /api/todolists/:id/items (paginated).',
  })
  @ApiOkResponse({
    type: PaginatedTodoListsResponseDto,
    description: 'Paginated todo list summaries',
  })
  @ApiBadRequestResponse({
    type: ErrorResponseDto,
    description: 'page or pageSize out of range',
    example: {
      statusCode: 400,
      error: 'Bad Request',
      message: ['pageSize must not be greater than 50'],
    },
  })
  @Get()
  index(
    @Query() pagination: TodoListsPaginationQueryDto,
  ): Promise<PaginatedTodoListsResponseDto> {
    return this.todoListsService.all(
      pagination.page,
      pagination.pageSize,
    ) as unknown as Promise<PaginatedTodoListsResponseDto>;
  }

  @ApiOperation({
    summary: 'Get one todo list',
    description: 'Returns a single todo list with its items eager-loaded.',
  })
  @ApiOkResponse({ type: TodoListResponseDto })
  @ApiNotFoundResponse({
    type: ErrorResponseDto,
    description: 'Todo list does not exist',
    example: {
      statusCode: 400,
      error: 'Bad Request',
      message: 'Todo list 999 not found',
    },
  })
  @UseGuards(TodoListOwnershipGuard)
  @Get('/:todoListId')
  show(@Param() param: { todoListId: number }): Promise<TodoListResponseDto> {
    return this.todoListsService.get(param.todoListId) as Promise<TodoListResponseDto>;
  }

  @ApiOperation({
    summary: 'Create a todo list',
    description: 'Creates a new todo list. Returns the created list with id.',
  })
  @ApiBody({
    type: CreateTodoListDto,
    examples: {
      shopping: { value: { name: 'Shopping List' }, summary: 'Shopping list' },
      work: { value: { name: 'Work Tasks' }, summary: 'Work tasks' },
    },
  })
  @ApiCreatedResponse({
    type: TodoListResponseDto,
    description: 'The newly created todo list',
  })
  @ApiBadRequestResponse({
    type: ErrorResponseDto,
    description: 'name is missing or empty',
    example: {
      statusCode: 400,
      error: 'Bad Request',
      message: ['name should not be empty'],
    },
  })
  @Post()
  create(@Body() dto: CreateTodoListDto): Promise<TodoListResponseDto> {
    return this.todoListsService.create(dto) as Promise<TodoListResponseDto>;
  }

  @ApiOperation({
    summary: 'Update a todo list',
    description: 'Replaces the list name. Items are not affected.',
  })
  @ApiBody({
    type: UpdateTodoListDto,
    examples: {
      rename: { value: { name: 'Shopping List (renamed)' }, summary: 'Rename' },
    },
  })
  @ApiOkResponse({ type: TodoListResponseDto })
  @ApiBadRequestResponse({
    type: ErrorResponseDto,
    description: 'name is missing or empty',
    example: {
      statusCode: 400,
      error: 'Bad Request',
      message: ['name should not be empty'],
    },
  })
  @ApiNotFoundResponse({
    type: ErrorResponseDto,
    description: 'Todo list does not exist',
    example: {
      statusCode: 404,
      error: 'Not Found',
      message: 'Todo list 999 not found',
    },
  })
  @UseGuards(TodoListOwnershipGuard)
  @Put('/:todoListId')
  update(
    @Param() param: { todoListId: string },
    @Body() dto: UpdateTodoListDto,
  ): Promise<TodoListResponseDto> {
    return this.todoListsService.update(
      Number(param.todoListId),
      dto,
    ) as Promise<TodoListResponseDto>;
  }

  @ApiOperation({
    summary: 'Delete a todo list',
    description: 'Cascades to all items in the list.',
  })
  @ApiOkResponse({ description: 'Todo list deleted' })
  @ApiNotFoundResponse({
    type: ErrorResponseDto,
    description: 'Todo list does not exist',
    example: {
      statusCode: 404,
      error: 'Not Found',
      message: 'Todo list 999 not found',
    },
  })
  @UseGuards(TodoListOwnershipGuard)
  @Delete('/:todoListId')
  delete(@Param() param: { todoListId: number }): Promise<void> {
    return this.todoListsService.delete(param.todoListId);
  }
}
