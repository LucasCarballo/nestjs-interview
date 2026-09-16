import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TodoListsModule } from './todo_lists/todo_lists.module';
import { ListItemsModule } from './list_items/list_items.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TodoList } from './todo_lists/todo_list.entity';
import { ListItem } from './list_items/list_item.entity';

@Module({
  imports: [
    TodoListsModule,
    ListItemsModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT ?? 5432),
      username: process.env.DB_USERNAME ?? 'postgres',
      password: process.env.DB_PASSWORD ?? 'postgres',
      database: process.env.DB_DATABASE ?? 'nestjs_db',
      entities: [TodoList, ListItem],
      synchronize: true,
      // ponytail: errors+warnings only; `true` drowns request logs in SQL
      logging: ['error', 'warn'],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: Number(process.env.THROTTLE_TTL_MS ?? 60000),
        limit: Number(process.env.THROTTLE_LIMIT ?? 100),
      },
    ]),
  ],
  controllers: [],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
