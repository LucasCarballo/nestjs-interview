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
import { CreateListItemDto } from './dtos/create-list-item';
import { UpdateListItemDto } from './dtos/update-list-item';
import { ListItem } from '../interfaces/list_item.interface';
import { ListItemsService } from './list_items.service';

@ApiTags('list-items')
@Controller('api/todolists/:todoListId/listitems')
export class ListItemsController {
  constructor(private listItemsService: ListItemsService) {}

  @ApiOperation({ summary: 'List all items in a todo list' })
  @Get()
  index(@Param() param: { todoListId: number }): Promise<ListItem[]> {
    return this.listItemsService.all(param.todoListId);
  }

  @ApiOperation({ summary: 'Get a single list item' })
  @Get('/:listItemId')
  show(
    @Param() param: { todoListId: number; listItemId: number },
  ): Promise<ListItem> {
    return this.listItemsService.get(param.todoListId, param.listItemId);
  }

  @ApiOperation({ summary: 'Create a list item under a todo list' })
  @Post()
  create(
    @Param() param: { todoListId: number },
    @Body() dto: CreateListItemDto,
  ): Promise<ListItem> {
    return this.listItemsService.create(param.todoListId, dto);
  }

  @ApiOperation({ summary: 'Update a list item' })
  @Put('/:listItemId')
  update(
    @Param() param: { todoListId: number; listItemId: string },
    @Body() dto: UpdateListItemDto,
  ): Promise<ListItem> {
    return this.listItemsService.update(
      param.todoListId,
      Number(param.listItemId),
      dto,
    );
  }

  @ApiOperation({ summary: 'Delete a list item' })
  @Delete('/:listItemId')
  delete(
    @Param() param: { todoListId: number; listItemId: number },
  ): Promise<void> {
    return this.listItemsService.delete(param.todoListId, param.listItemId);
  }
}
