import { Module } from '@nestjs/common';
import { ListItemsController } from './list_items.controller';
import { ListItemsService } from './list_items.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ListItem } from './list_item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ListItem])],
  controllers: [ListItemsController],
  providers: [ListItemsService],
  exports: [ListItemsService],
})
export class ListItemsModule {}
