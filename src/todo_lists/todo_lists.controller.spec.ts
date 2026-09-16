import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TodoListsController } from './todo_lists.controller';
import { TodoListsService } from './todo_lists.service';
import { AuthUser } from '../auth/current-user.decorator';

const user: AuthUser = { userId: 7, email: 'ada@example.com' };

describe('TodoListsController', () => {
  let controller: TodoListsController;
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
      controllers: [TodoListsController],
      providers: [{ provide: TodoListsService, useValue: service }],
    })
      .overrideGuard(require('../auth/jwt-auth.guard').JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(
        require('../auth/ownership.guard').TodoListOwnershipGuard,
      )
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<TodoListsController>(TodoListsController);
  });

  describe('index', () => {
    it('delegates to service.all with the authenticated user', async () => {
      const lists = [{ id: 1, name: 'Shopping List', items: [] }];
      service.all.mockResolvedValue(lists);
      await expect(controller.index(user)).resolves.toEqual(lists);
      expect(service.all).toHaveBeenCalledWith(7);
    });
  });

  describe('show', () => {
    it('delegates to service.get with userId and id', async () => {
      const list = { id: 1, name: 'Shopping List', items: [] };
      service.get.mockResolvedValue(list);
      await expect(
        controller.show(user, { todoListId: 1 }),
      ).resolves.toEqual(list);
      expect(service.get).toHaveBeenCalledWith(7, 1);
    });

    it('propagates NotFoundException from the service', async () => {
      service.get.mockRejectedValue(new NotFoundException());
      await expect(
        controller.show(user, { todoListId: 999 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('delegates to service.create with the user and body', async () => {
      const dto = { name: 'New List' };
      const created = { id: 1, name: 'New List', items: [] };
      service.create.mockResolvedValue(created);
      await expect(controller.create(user, dto)).resolves.toEqual(created);
      expect(service.create).toHaveBeenCalledWith(7, dto);
    });
  });

  describe('update', () => {
    it('delegates to service.update converting the id to a number', async () => {
      const dto = { name: 'Updated List' };
      const updated = { id: 1, name: 'Updated List', items: [] };
      service.update.mockResolvedValue(updated);
      await expect(
        controller.update(user, { todoListId: '1' }, dto),
      ).resolves.toEqual(updated);
      expect(service.update).toHaveBeenCalledWith(7, 1, dto);
    });
  });

  describe('delete', () => {
    it('delegates to service.delete with userId and id', async () => {
      service.delete.mockResolvedValue(undefined);
      await expect(
        controller.delete(user, { todoListId: 1 }),
      ).resolves.toBeUndefined();
      expect(service.delete).toHaveBeenCalledWith(7, 1);
    });
  });
});
