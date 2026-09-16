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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateListItemDto } from './dtos/create-list-item';
import { UpdateListItemDto } from './dtos/update-list-item';
import { ListItem } from './list_item.entity';
import { ListItemsService } from './list_items.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  TodoListOwnershipGuard,
  ListItemOwnershipGuard,
} from '../auth/ownership.guard';
import { AuthUser, CurrentUser } from '../auth/current-user.decorator';

@ApiTags('list-items')
@ApiBearerAuth()
// Class-level JWT, plus per-route ownership checks (parent list for create/markAllDone,
// specific item for update/delete).
@UseGuards(JwtAuthGuard)
@Controller('api/todolists/:todoListId')
export class ListItemsController {
  constructor(private listItemsService: ListItemsService) {}

  @ApiOperation({ summary: 'Add an item to one of my todo lists' })
  @UseGuards(TodoListOwnershipGuard)
  @Post('/items')
  create(
    @CurrentUser() user: AuthUser,
    @Param() param: { todoListId: number },
    @Body() dto: CreateListItemDto,
  ): Promise<ListItem> {
    return this.listItemsService.create(user.userId, param.todoListId, dto);
  }

  @ApiOperation({ summary: 'Toggle or rename one of my items' })
  @UseGuards(ListItemOwnershipGuard)
  @Patch('/items/:itemId')
  update(
    @CurrentUser() user: AuthUser,
    @Param() param: { todoListId: number; itemId: number },
    @Body() dto: UpdateListItemDto,
  ): Promise<ListItem> {
    return this.listItemsService.update(
      user.userId,
      param.todoListId,
      param.itemId,
      dto,
    );
  }

  @ApiOperation({ summary: 'Delete one of my items' })
  @UseGuards(ListItemOwnershipGuard)
  @HttpCode(204)
  @Delete('/items/:itemId')
  delete(
    @CurrentUser() user: AuthUser,
    @Param() param: { todoListId: number; itemId: number },
  ): Promise<void> {
    return this.listItemsService.delete(
      user.userId,
      param.todoListId,
      param.itemId,
    );
  }

  @ApiOperation({ summary: 'Mark all items of one of my todo lists as done' })
  @UseGuards(TodoListOwnershipGuard)
  @Put('/done')
  markAllDone(
    @CurrentUser() user: AuthUser,
    @Param() param: { todoListId: number },
  ): Promise<void> {
    return this.listItemsService.markAllDone(user.userId, param.todoListId);
  }
}
