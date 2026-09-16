import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Todo API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Mirror the Swagger wiring from src/main.ts
    const config = new DocumentBuilder()
      .setTitle('Todo API')
      .setDescription('CRUD for todo lists and list items')
      .setVersion('1.0')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('exposes the Swagger UI', async () => {
    await request(app.getHttpServer()).get('/api/docs').expect(200);
  });

  it('lists, creates, fetches and deletes a todo list', async () => {
    // Initially empty
    const empty = await request(app.getHttpServer())
      .get('/api/todolists')
      .expect(200);
    expect(Array.isArray(empty.body)).toBe(true);

    // Create
    const created = await request(app.getHttpServer())
      .post('/api/todolists')
      .send({ name: 'e2e list' })
      .expect(201);
    expect(created.body.id).toBeDefined();
    expect(created.body.name).toBe('e2e list');

    // Fetch by id
    const fetched = await request(app.getHttpServer())
      .get(`/api/todolists/${created.body.id}`)
      .expect(200);
    expect(fetched.body.name).toBe('e2e list');

    // Delete
    await request(app.getHttpServer())
      .delete(`/api/todolists/${created.body.id}`)
      .expect(200);
  });
});