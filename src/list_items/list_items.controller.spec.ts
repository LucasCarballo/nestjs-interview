import { Test, TestingModule } from '@nestjs/testing';
import { ListItemsController } from './list_items.controller';
import { ListItemsService } from './list_items.service';

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
    it('delegates to service.create with todoListId and body', async () => {
      const dto = { value: 'Buy milk' };
      const created = { id: 1, value: 'Buy milk', todoListId: 1 };
      service.create.mockResolvedValue(created);
      await expect(
        controller.create({ todoListId: 1 }, dto),
      ).resolves.toEqual(created);
      expect(service.create).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('update', () => {
    it('delegates to service.update with todoListId, itemId, and body', async () => {
      const dto = { done: true };
      const updated = { id: 1, value: 'Buy milk', todoListId: 1, done: true };
      service.update.mockResolvedValue(updated);
      await expect(
        controller.update({ todoListId: 1, itemId: 1 }, dto),
      ).resolves.toEqual(updated);
      expect(service.update).toHaveBeenCalledWith(1, 1, dto);
    });
  });

  describe('delete', () => {
    it('delegates to service.delete with todoListId and itemId', async () => {
      service.delete.mockResolvedValue(undefined);
      await expect(
        controller.delete({ todoListId: 1, itemId: 1 }),
      ).resolves.toBeUndefined();
      expect(service.delete).toHaveBeenCalledWith(1, 1);
    });
  });

  describe('markAllDone', () => {
    it('delegates to service.markAllDone with todoListId', async () => {
      service.markAllDone.mockResolvedValue(undefined);
      await expect(
        controller.markAllDone({ todoListId: 1 }),
      ).resolves.toBeUndefined();
      expect(service.markAllDone).toHaveBeenCalledWith(1);
    });
  });
});
