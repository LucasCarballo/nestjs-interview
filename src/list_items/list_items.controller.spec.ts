import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ListItemsController } from './list_items.controller';
import { ListItemsService } from './list_items.service';
import { AuthUser } from '../auth/current-user.decorator';

const user: AuthUser = { userId: 7, email: 'ada@example.com' };

describe('ListItemsController', () => {
  let controller: ListItemsController;
  let service: jest.Mocked<Record<string, jest.Mock>>;

  beforeEach(async () => {
    service = {
      all: jest.fn(),
      get: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
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

  describe('index', () => {
    it('delegates to service.all with the user and todoListId', async () => {
      const items = [{ id: 1, value: 'Buy milk', todoListId: 1 }];
      service.all.mockResolvedValue(items);

      await expect(
        controller.index(user, { todoListId: 1 }),
      ).resolves.toEqual(items);
      expect(service.all).toHaveBeenCalledWith(7, 1);
    });
  });

  describe('show', () => {
    it('delegates to service.get with userId and both ids', async () => {
      const item = { id: 1, value: 'Buy milk', todoListId: 1 };
      service.get.mockResolvedValue(item);

      await expect(
        controller.show(user, { todoListId: 1, listItemId: 1 }),
      ).resolves.toEqual(item);
      expect(service.get).toHaveBeenCalledWith(7, 1, 1);
    });

    it('propagates NotFoundException from the service', async () => {
      service.get.mockRejectedValue(new NotFoundException());
      await expect(
        controller.show(user, { todoListId: 1, listItemId: 999 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('delegates to service.create with the user, todoListId, and body', async () => {
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
    it('delegates to service.update converting the item id to a number', async () => {
      const dto = { value: 'Buy oat milk' };
      const updated = { id: 1, value: 'Buy oat milk', todoListId: 1 };
      service.update.mockResolvedValue(updated);

      await expect(
        controller.update(user, { todoListId: 1, listItemId: '1' }, dto),
      ).resolves.toEqual(updated);
      expect(service.update).toHaveBeenCalledWith(7, 1, 1, dto);
    });
  });

  describe('delete', () => {
    it('delegates to service.delete with userId and both ids', async () => {
      service.delete.mockResolvedValue(undefined);

      await expect(
        controller.delete(user, { todoListId: 1, listItemId: 1 }),
      ).resolves.toBeUndefined();
      expect(service.delete).toHaveBeenCalledWith(7, 1, 1);
    });
  });
});
