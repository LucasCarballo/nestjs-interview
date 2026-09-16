import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
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

    // Mirror the wiring from src/main.ts
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
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

    // Update
    const updated = await request(app.getHttpServer())
      .put(`/api/todolists/${created.body.id}`)
      .send({ name: 'e2e list renamed' })
      .expect(200);
    expect(updated.body.name).toBe('e2e list renamed');

    // Delete
    await request(app.getHttpServer())
      .delete(`/api/todolists/${created.body.id}`)
      .expect(200);
  });

  it('returns 404 for missing resources', async () => {
    await request(app.getHttpServer()).get('/api/todolists/999999').expect(404);
    await request(app.getHttpServer())
      .put('/api/todolists/999999')
      .send({ name: 'nope' })
      .expect(404);
    await request(app.getHttpServer()).delete('/api/todolists/999999').expect(404);
    await request(app.getHttpServer())
      .get('/api/todolists/999999/listitems/999999')
      .expect(404);
  });

  it('rejects invalid payloads', async () => {
    await request(app.getHttpServer()).post('/api/todolists').send({}).expect(400);
    await request(app.getHttpServer())
      .post('/api/todolists')
      .send({ name: '' })
      .expect(400);
  });

  it('deleting a todo list cascades to its items', async () => {
    const list = await request(app.getHttpServer())
      .post('/api/todolists')
      .send({ name: 'cascade list' })
      .expect(201);

    const item = await request(app.getHttpServer())
      .post(`/api/todolists/${list.body.id}/listitems`)
      .send({ value: 'Buy milk' })
      .expect(201);
    expect(Number(item.body.todoListId)).toBe(list.body.id);

    await request(app.getHttpServer())
      .delete(`/api/todolists/${list.body.id}`)
      .expect(200);

    // Item is gone with its list
    await request(app.getHttpServer())
      .get(`/api/todolists/${list.body.id}/listitems/${item.body.id}`)
      .expect(404);
  });

  it('rejects list items under a non-existent todo list', async () => {
    await request(app.getHttpServer())
      .post('/api/todolists/999999/listitems')
      .send({ value: 'orphan' })
      .expect(500); // FK violation
  });
});