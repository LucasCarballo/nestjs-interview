import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateListItemDto } from './dtos/create-list-item';
import { UpdateListItemDto } from './dtos/update-list-item';
import { ListItemResponseDto } from './dtos/list-item-response.dto';
import { PaginatedListItemsResponseDto } from './dtos/paginated-list-items-response.dto';
import { PaginationQueryDto } from '../common/dtos/pagination-query.dto';
import { ErrorResponseDto } from '../common/dtos/error-response.dto';
import { ListItemsService } from './list_items.service';
import {
  TodoListOwnershipGuard,
  ListItemOwnershipGuard,
} from '../auth/ownership.guard';

@ApiTags('list-items')
// Class-level ownership on the parent list; per-route ownership on the item
// (PATCH/DELETE need :itemId, POST/list/markAllDone don't).
@UseGuards(TodoListOwnershipGuard)
@Controller('api/todolists/:todoListId')
export class ListItemsController {
  constructor(private listItemsService: ListItemsService) {}

  @ApiOperation({
    summary: 'List items of a todo list (paginated)',
    description:
      'Returns items with pagination metadata. Use this to fetch beyond ' +
      'the cap that the parent GET embeds, or to page through items.',
  })
  @ApiOkResponse({
    type: PaginatedListItemsResponseDto,
    description: 'Paginated items of the todo list',
  })
  @ApiBadRequestResponse({
    type: ErrorResponseDto,
    description: 'page or pageSize out of range',
    example: {
      statusCode: 400,
      error: 'Bad Request',
      message: ['pageSize must not be greater than 200'],
    },
  })
  @ApiNotFoundResponse({
    type: ErrorResponseDto,
    description: 'Parent todo list does not exist',
    example: {
      statusCode: 404,
      error: 'Not Found',
      message: 'Todo list 999 not found',
    },
  })
  @Get('/items')
  list(
    @Param() param: { todoListId: number },
    @Query() pagination: PaginationQueryDto,
  ): Promise<PaginatedListItemsResponseDto> {
    return this.listItemsService.list(
      param.todoListId,
      pagination.page,
      pagination.pageSize,
    ) as Promise<PaginatedListItemsResponseDto>;
  }

  @ApiOperation({
    summary: 'Add an item to a todo list',
    description: 'Creates a new item under the parent list.',
  })
  @ApiBody({
    type: CreateListItemDto,
    examples: {
      milk: { value: { value: 'Buy milk' }, summary: 'A new item' },
      eggs: { value: { value: 'Buy eggs' }, summary: 'Another item' },
    },
  })
  @ApiCreatedResponse({
    type: ListItemResponseDto,
    description: 'The newly created item',
  })
  @ApiBadRequestResponse({
    type: ErrorResponseDto,
    description: 'value is missing or empty',
    example: {
      statusCode: 400,
      error: 'Bad Request',
      message: ['value should not be empty'],
    },
  })
  @ApiNotFoundResponse({
    type: ErrorResponseDto,
    description: 'Parent todo list does not exist',
    example: {
      statusCode: 404,
      error: 'Not Found',
      message: 'Todo list 999 not found',
    },
  })
  @Post('/items')
  create(
    @Param() param: { todoListId: number },
    @Body() dto: CreateListItemDto,
  ): Promise<ListItemResponseDto> {
    return this.listItemsService.create(
      param.todoListId,
      dto,
    ) as Promise<ListItemResponseDto>;
  }

  @ApiOperation({
    summary: 'Update an item',
    description:
      'Partial update — send only the fields you want to change. Typical use: toggle done.',
  })
  @ApiBody({
    type: UpdateListItemDto,
    examples: {
      toggleDone: {
        value: { done: true },
        summary: 'Mark done',
      },
      rename: {
        value: { value: 'Buy oat milk' },
        summary: 'Rename',
      },
      both: {
        value: { value: 'Buy oat milk', done: true },
        summary: 'Rename and mark done',
      },
    },
  })
  @ApiOkResponse({ type: ListItemResponseDto })
  @ApiBadRequestResponse({
    type: ErrorResponseDto,
    description: 'done is not a boolean, etc.',
    example: {
      statusCode: 400,
      error: 'Bad Request',
      message: ['done must be a boolean value'],
    },
  })
  @ApiNotFoundResponse({
    type: ErrorResponseDto,
    description: 'Todo list or item does not exist',
    example: {
      statusCode: 404,
      error: 'Not Found',
      message: 'List item 999 not found',
    },
  })
  @UseGuards(ListItemOwnershipGuard)
  @Patch('/items/:itemId')
  update(
    @Param() param: { todoListId: number; itemId: number },
    @Body() dto: UpdateListItemDto,
  ): Promise<ListItemResponseDto> {
    return this.listItemsService.update(
      param.todoListId,
      param.itemId,
      dto,
    ) as Promise<ListItemResponseDto>;
  }

  @ApiOperation({
    summary: 'Delete an item',
    description: 'Removes one item from the list.',
  })
  @ApiNoContentResponse({ description: 'Item deleted' })
  @ApiNotFoundResponse({
    type: ErrorResponseDto,
    description: 'Todo list or item does not exist',
    example: {
      statusCode: 404,
      error: 'Not Found',
      message: 'List item 999 not found',
    },
  })
  @UseGuards(ListItemOwnershipGuard)
  @HttpCode(204)
  @Delete('/items/:itemId')
  delete(
    @Param() param: { todoListId: number; itemId: number },
  ): Promise<void> {
    return this.listItemsService.delete(param.todoListId, param.itemId);
  }

  @ApiOperation({
    summary: 'Mark all items of a todo list as done',
    description:
      'Bulk UPDATE — one round trip no matter how many items the list has.',
  })
  @ApiOkResponse({ description: 'All items marked done' })
  @ApiNotFoundResponse({
    type: ErrorResponseDto,
    description: 'Todo list does not exist (no items to update)',
    example: {
      statusCode: 404,
      error: 'Not Found',
      message: 'Todo list 999 not found',
    },
  })
  @Put('/done')
  markAllDone(@Param() param: { todoListId: number }): Promise<void> {
    return this.listItemsService.markAllDone(param.todoListId);
  }
}
