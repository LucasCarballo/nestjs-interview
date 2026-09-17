import type { NestExpressApplication } from '@nestjs/platform-express';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalInterceptors(new LoggingInterceptor());

  // CORS: explicit origins via CORS_ORIGIN (comma-separated); permissive in dev
  app.enableCors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  });

  const config = new DocumentBuilder()
    .setTitle('Todo API')
    .setDescription(
      'CRUD for todo lists with nested list items. Every list/item is ' +
        'eager-loaded into a single response; no separate read endpoints ' +
        'for items.',
    )
    .setVersion('1')
    .addTag('todo-lists', 'Operations on todo lists and their items')
    .build();

  // deepScanRoutes: true makes the scanner walk every @ApiBody / @ApiResponse
  // decorator and register the referenced DTOs in components.schemas. Without
  // it, only body DTOs referenced by @Body() appear.
  const document = SwaggerModule.createDocument(app, config, {
    deepScanRoutes: true,
  });
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(3000);
}
void bootstrap();
