import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

// Don't let the global throttler guard trip tests on repeated runs
process.env.THROTTLE_LIMIT = '10000';

describe('Todo API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    const config = new DocumentBuilder()
      .setTitle('Todo API')
      .setDescription('CRUD for todo lists with nested list items')
      .setVersion('1')
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

  it('lists, creates, fetches and deletes a todo list (with items nested)', async () => {
    const empty = await request(app.getHttpServer())
      .get('/api/todolists')
      .expect(200);
    expect(Array.isArray(empty.body.items)).toBe(true);
    expect(empty.body.total).toBe(0);

    const created = await request(app.getHttpServer())
      .post('/api/todolists')
      .send({ name: 'e2e list' })
      .expect(201);
    expect(created.body.id).toBeDefined();
    expect(created.body.name).toBe('e2e list');
    expect(created.body.items).toEqual([]);

    const fetched = await request(app.getHttpServer())
      .get(`/api/todolists/${created.body.id}`)
      .expect(200);
    expect(fetched.body.name).toBe('e2e list');
    expect(Array.isArray(fetched.body.items)).toBe(true);

    const updated = await request(app.getHttpServer())
      .put(`/api/todolists/${created.body.id}`)
      .send({ name: 'e2e list renamed' })
      .expect(200);
    expect(updated.body.name).toBe('e2e list renamed');

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
    await request(app.getHttpServer())
      .delete('/api/todolists/999999')
      .expect(404);
  });

  it('rejects invalid payloads', async () => {
    await request(app.getHttpServer())
      .post('/api/todolists')
      .send({})
      .expect(400);
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

    await request(app.getHttpServer())
      .post(`/api/todolists/${list.body.id}/items`)
      .send({ value: 'Buy milk' })
      .expect(201);

    await request(app.getHttpServer())
      .delete(`/api/todolists/${list.body.id}`)
      .expect(200);

    await request(app.getHttpServer())
      .get(`/api/todolists/${list.body.id}`)
      .expect(404);
  });

  it('rejects items under a non-existent todo list with 404', async () => {
    await request(app.getHttpServer())
      .post('/api/todolists/999999/items')
      .send({ value: 'orphan' })
      .expect(404);
  });

  it('toggles a single list item via PATCH and reflects it in GET /:id', async () => {
    const list = await request(app.getHttpServer())
      .post('/api/todolists')
      .send({ name: 'single done' })
      .expect(201);

    const item = await request(app.getHttpServer())
      .post(`/api/todolists/${list.body.id}/items`)
      .send({ value: 'Buy milk' })
      .expect(201);
    expect(item.body.done).toBe(false);

    await request(app.getHttpServer())
      .patch(`/api/todolists/${list.body.id}/items/${item.body.id}`)
      .send({ done: 'yes' })
      .expect(400);

    const updated = await request(app.getHttpServer())
      .patch(`/api/todolists/${list.body.id}/items/${item.body.id}`)
      .send({ done: true })
      .expect(200);
    expect(updated.body.done).toBe(true);

    const refetched = await request(app.getHttpServer())
      .get(`/api/todolists/${list.body.id}`)
      .expect(200);
    expect(refetched.body.items).toHaveLength(1);
    expect(refetched.body.items[0].done).toBe(true);
  });

  it('deletes a single item without affecting the list', async () => {
    const list = await request(app.getHttpServer())
      .post('/api/todolists')
      .send({ name: 'item delete' })
      .expect(201);

    const item = await request(app.getHttpServer())
      .post(`/api/todolists/${list.body.id}/items`)
      .send({ value: 'Buy milk' })
      .expect(201);

    await request(app.getHttpServer())
      .delete(`/api/todolists/${list.body.id}/items/${item.body.id}`)
      .expect(204);

    const refetched = await request(app.getHttpServer())
      .get(`/api/todolists/${list.body.id}`)
      .expect(200);
    expect(refetched.body.items).toEqual([]);
  });

  it('marks all list items of a todo list as done in one call', async () => {
    const list = await request(app.getHttpServer())
      .post('/api/todolists')
      .send({ name: 'bulk done' })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/api/todolists/${list.body.id}/items`)
      .send({ value: 'Buy milk' })
      .expect(201);
    await request(app.getHttpServer())
      .post(`/api/todolists/${list.body.id}/items`)
      .send({ value: 'Buy eggs' })
      .expect(201);

    await request(app.getHttpServer())
      .put(`/api/todolists/${list.body.id}/done`)
      .expect(200);

    const refetched = await request(app.getHttpServer())
      .get(`/api/todolists/${list.body.id}`)
      .expect(200);
    expect(refetched.body.items).toHaveLength(2);
    expect(
      refetched.body.items.map((i: { done: boolean }) => i.done),
    ).toEqual([true, true]);

    await request(app.getHttpServer())
      .put(`/api/todolists/${list.body.id}/done`)
      .expect(200);
  });

  it('returns 404 when marking a missing todo list as done', async () => {
    await request(app.getHttpServer())
      .put('/api/todolists/999999/done')
      .expect(404);
  });

  it('caps items in the parent response and exposes pagination metadata', async () => {
    // 25 items, cap is 20 -> itemsTruncated=true, totalItems=25
    const list = await request(app.getHttpServer())
      .post('/api/todolists')
      .send({ name: 'big list' })
      .expect(201);
    const itemIds: number[] = [];
    for (let i = 0; i < 25; i++) {
      const r = await request(app.getHttpServer())
        .post(`/api/todolists/${list.body.id}/items`)
        .send({ value: `item ${i}` });
      itemIds.push(r.body.id);
    }

    const parent = await request(app.getHttpServer())
      .get(`/api/todolists/${list.body.id}`)
      .expect(200);
    expect(parent.body.items).toHaveLength(20);
    expect(parent.body.totalItems).toBe(25);
    expect(parent.body.itemsTruncated).toBe(true);

    // Paginated endpoint can fetch the missing 5
    const page2 = await request(app.getHttpServer())
      .get(`/api/todolists/${list.body.id}/items?page=2&pageSize=20`)
      .expect(200);
    expect(page2.body.items).toHaveLength(5);
    expect(page2.body.total).toBe(25);
    expect(page2.body.page).toBe(2);
    expect(page2.body.pageSize).toBe(20);
    expect(page2.body.totalPages).toBe(2);

    // pageSize > 200 -> 400
    await request(app.getHttpServer())
      .get(`/api/todolists/${list.body.id}/items?pageSize=201`)
      .expect(400);

    // page < 1 -> 400
    await request(app.getHttpServer())
      .get(`/api/todolists/${list.body.id}/items?page=0`)
      .expect(400);

    // missing parent -> 404
    await request(app.getHttpServer())
      .get('/api/todolists/999999/items')
      .expect(404);
  });

  it('does not truncate when items <= cap', async () => {
    const list = await request(app.getHttpServer())
      .post('/api/todolists')
      .send({ name: 'small list' })
      .expect(201);
    for (let i = 0; i < 5; i++) {
      await request(app.getHttpServer())
        .post(`/api/todolists/${list.body.id}/items`)
        .send({ value: `item ${i}` })
        .expect(201);
    }
    const parent = await request(app.getHttpServer())
      .get(`/api/todolists/${list.body.id}`)
      .expect(200);
    expect(parent.body.items).toHaveLength(5);
    expect(parent.body.totalItems).toBe(5);
    expect(parent.body.itemsTruncated).toBe(false);
  });

  it('paginates the index endpoint with summary lists', async () => {
    // Create 3 lists with a unique prefix so we can count "ours" in a
    // shared DB. (Tests don't reset the DB between cases.)
    const prefix = `paginated-${Date.now()}-`;
    const createdIds: number[] = [];
    for (let i = 0; i < 3; i++) {
      const r = await request(app.getHttpServer())
        .post('/api/todolists')
        .send({ name: `${prefix}${i}` })
        .expect(201);
      createdIds.push(r.body.id);
    }

    // Default page size of 50 — every list fits in one page.
    const page1 = await request(app.getHttpServer())
      .get('/api/todolists')
      .expect(200);
    expect(page1.body.pageSize).toBe(50);
    expect(page1.body.page).toBe(1);
    expect(page1.body.items.length).toBeGreaterThanOrEqual(3);
    // All 3 of ours are present, with count fields populated (0 because
    // we didn't add items to these lists)
    const ours = page1.body.items.filter((l: { id: number }) =>
      createdIds.includes(l.id),
    );
    expect(ours).toHaveLength(3);
    // Summary shape — no items nested, but counts are real
    for (const list of page1.body.items) {
      expect(list.items).toBeUndefined();
      expect(typeof list.totalItems).toBe('number');
      expect(typeof list.doneItems).toBe('number');
    }

    // pageSize=2 — only 2 lists per page
    const p1s2 = await request(app.getHttpServer())
      .get('/api/todolists?page=1&pageSize=2')
      .expect(200);
    expect(p1s2.body.items).toHaveLength(2);
    expect(p1s2.body.page).toBe(1);
    expect(p1s2.body.pageSize).toBe(2);
    expect(p1s2.body.total).toBeGreaterThanOrEqual(3);
    expect(p1s2.body.totalPages).toBeGreaterThanOrEqual(2);

    const p2s2 = await request(app.getHttpServer())
      .get('/api/todolists?page=2&pageSize=2')
      .expect(200);
    expect(p2s2.body.page).toBe(2);
    expect(p2s2.body.items).toHaveLength(2);

    // pageSize > 50 -> 400
    await request(app.getHttpServer())
      .get('/api/todolists?pageSize=51')
      .expect(400);
  });

  it('reports totalItems and doneItems per list in the index', async () => {
    const r = await request(app.getHttpServer())
      .post('/api/todolists')
      .send({ name: `counts-${Date.now()}` })
      .expect(201);
    const id = r.body.id;
    // 4 items, 2 marked done
    for (const v of ['a', 'b', 'c', 'd']) {
      const item = await request(app.getHttpServer())
        .post(`/api/todolists/${id}/items`)
        .send({ value: v })
        .expect(201);
      if (v === 'b' || v === 'd') {
        await request(app.getHttpServer())
          .patch(`/api/todolists/${id}/items/${item.body.id}`)
          .send({ done: true })
          .expect(200);
      }
    }
    const index = await request(app.getHttpServer())
      .get('/api/todolists')
      .expect(200);
    const mine = index.body.items.find((l: { id: number }) => l.id === id);
    expect(mine).toBeDefined();
    expect(mine.totalItems).toBe(4);
    expect(mine.doneItems).toBe(2);
  });
});
