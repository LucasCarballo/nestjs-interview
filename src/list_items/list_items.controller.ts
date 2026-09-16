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
import { CreateListItemDto } from './dtos/create-list-item';
import { UpdateListItemDto } from './dtos/update-list-item';
import { ListItem } from './list_item.entity';
import { ListItemsService } from './list_items.service';
import { AuthUser, CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ListItemOwnershipGuard } from '../auth/ownership.guard';

@ApiTags('list-items')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/todolists/:todoListId/listitems')
export class ListItemsController {
  constructor(private listItemsService: ListItemsService) {}

  // No :listItemId -> parent list ownership checked via service-level userId filter
  @ApiOperation({ summary: 'List items in one of my todo lists' })
  @Get()
  index(
    @CurrentUser() user: AuthUser,
    @Param() param: { todoListId: number },
  ): Promise<ListItem[]> {
    return this.listItemsService.all(user.userId, param.todoListId);
  }

  @ApiOperation({ summary: 'Get one item from one of my todo lists' })
  @UseGuards(ListItemOwnershipGuard)
  @Get('/:listItemId')
  show(
    @CurrentUser() user: AuthUser,
    @Param() param: { todoListId: number; listItemId: number },
  ): Promise<ListItem> {
    return this.listItemsService.get(
      user.userId,
      param.todoListId,
      param.listItemId,
    );
  }

  @ApiOperation({ summary: 'Create an item in one of my todo lists' })
  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Param() param: { todoListId: number },
    @Body() dto: CreateListItemDto,
  ): Promise<ListItem> {
    return this.listItemsService.create(user.userId, param.todoListId, dto);
  }

  @ApiOperation({ summary: 'Update one of my items' })
  @UseGuards(ListItemOwnershipGuard)
  @Put('/:listItemId')
  update(
    @CurrentUser() user: AuthUser,
    @Param() param: { todoListId: number; listItemId: string },
    @Body() dto: UpdateListItemDto,
  ): Promise<ListItem> {
    return this.listItemsService.update(
      user.userId,
      param.todoListId,
      Number(param.listItemId),
      dto,
    );
  }

  @ApiOperation({ summary: 'Delete one of my items' })
  @UseGuards(ListItemOwnershipGuard)
  @Delete('/:listItemId')
  delete(
    @CurrentUser() user: AuthUser,
    @Param() param: { todoListId: number; listItemId: number },
  ): Promise<void> {
    return this.listItemsService.delete(
      user.userId,
      param.todoListId,
      param.listItemId,
    );
  }
}
