import { Test, TestingModule } from '@nestjs/testing';
import { ListItemsController } from './list_items.controller';
import { ListItemsService } from './list_items.service';
import { AuthUser } from '../auth/current-user.decorator';

const user: AuthUser = { userId: 7, email: 'ada@example.com' };

describe('ListItemsController', () => {
  let controller: ListItemsController;
  let service: jest.Mocked<Record<string, jest.Mock>>;

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      markAllDone: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ListItemsController],
      providers: [{ provide: ListItemsService, useValue: service }],
    })
      .overrideGuard(require('../auth/jwt-auth.guard').JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(
        require('../auth/ownership.guard').TodoListOwnershipGuard,
      )
      .useValue({ canActivate: () => true })
      .overrideGuard(
        require('../auth/ownership.guard').ListItemOwnershipGuard,
      )
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ListItemsController>(ListItemsController);
  });

  describe('create', () => {
    it('delegates to service.create with user, todoListId, body', async () => {
      const dto = { value: 'Buy milk' };
      const created = { id: 1, value: 'Buy milk', todoListId: 1 };
      service.create.mockResolvedValue(created);
      await expect(
        controller.create(user, { todoListId: 1 }, dto),
      ).resolves.toEqual(created);
      expect(service.create).toHaveBeenCalledWith(7, 1, dto);
    });
  });

  describe('update', () => {
    it('delegates to service.update with user, ids, body', async () => {
      const dto = { done: true };
      const updated = { id: 1, value: 'Buy milk', todoListId: 1, done: true };
      service.update.mockResolvedValue(updated);
      await expect(
        controller.update(user, { todoListId: 1, itemId: 1 }, dto),
      ).resolves.toEqual(updated);
      expect(service.update).toHaveBeenCalledWith(7, 1, 1, dto);
    });
  });

  describe('delete', () => {
    it('delegates to service.delete with user and ids', async () => {
      service.delete.mockResolvedValue(undefined);
      await expect(
        controller.delete(user, { todoListId: 1, itemId: 1 }),
      ).resolves.toBeUndefined();
      expect(service.delete).toHaveBeenCalledWith(7, 1, 1);
    });
  });

  describe('markAllDone', () => {
    it('delegates to service.markAllDone with user and todoListId', async () => {
      service.markAllDone.mockResolvedValue(undefined);
      await expect(
        controller.markAllDone(user, { todoListId: 1 }),
      ).resolves.toBeUndefined();
      expect(service.markAllDone).toHaveBeenCalledWith(7, 1);
    });
  });
});
