import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateListItemDto } from './dtos/create-list-item';
import { UpdateListItemDto } from './dtos/update-list-item';
import { ListItem } from './list_item.entity';
import { ListItemsService } from './list_items.service';
import {
  TodoListOwnershipGuard,
  ListItemOwnershipGuard,
} from '../auth/ownership.guard';

@ApiTags('list-items')
// Class-level ownership on the parent list; per-route ownership on the item
// (PATCH/DELETE need :itemId, POST/markAllDone don't).
@UseGuards(TodoListOwnershipGuard)
@Controller('api/todolists/:todoListId')
export class ListItemsController {
  constructor(private listItemsService: ListItemsService) {}

  @ApiOperation({ summary: 'Add an item to a todo list' })
  @Post('/items')
  create(
    @Param() param: { todoListId: number },
    @Body() dto: CreateListItemDto,
  ): Promise<ListItem> {
    return this.listItemsService.create(param.todoListId, dto);
  }

  @ApiOperation({ summary: 'Toggle or rename an item' })
  @UseGuards(ListItemOwnershipGuard)
  @Patch('/items/:itemId')
  update(
    @Param() param: { todoListId: number; itemId: number },
    @Body() dto: UpdateListItemDto,
  ): Promise<ListItem> {
    return this.listItemsService.update(
      param.todoListId,
      param.itemId,
      dto,
    );
  }

  @ApiOperation({ summary: 'Delete an item' })
  @UseGuards(ListItemOwnershipGuard)
  @HttpCode(204)
  @Delete('/items/:itemId')
  delete(
    @Param() param: { todoListId: number; itemId: number },
  ): Promise<void> {
    return this.listItemsService.delete(param.todoListId, param.itemId);
  }

  @ApiOperation({ summary: 'Mark all items of a todo list as done' })
  @Put('/done')
  markAllDone(@Param() param: { todoListId: number }): Promise<void> {
    return this.listItemsService.markAllDone(param.todoListId);
  }
}
