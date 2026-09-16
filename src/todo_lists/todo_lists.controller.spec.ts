import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TodoListsController } from './todo_lists.controller';
import { TodoListsService } from './todo_lists.service';
import { ListItemsService } from '../list_items/list_items.service';

describe('TodoListsController', () => {
  let controller: TodoListsController;
  let service: jest.Mocked<Record<string, jest.Mock>>;
  let listItemsService: jest.Mocked<Record<string, jest.Mock>>;

  beforeEach(async () => {
    service = {
      all: jest.fn(),
      get: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    listItemsService = {
      markAllDone: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TodoListsController],
      providers: [
        { provide: TodoListsService, useValue: service },
        { provide: ListItemsService, useValue: listItemsService },
      ],
    }).compile();

    controller = module.get<TodoListsController>(TodoListsController);
  });

  describe('index', () => {
    it('delegates to service.all', async () => {
      const lists = [{ id: 1, name: 'Shopping List' }];
      service.all.mockResolvedValue(lists);

      await expect(controller.index()).resolves.toEqual(lists);
      expect(service.all).toHaveBeenCalledTimes(1);
    });
  });

  describe('show', () => {
    it('delegates to service.get with the id from params', async () => {
      const list = { id: 1, name: 'Shopping List' };
      service.get.mockResolvedValue(list);

      await expect(controller.show({ todoListId: 1 })).resolves.toEqual(list);
      expect(service.get).toHaveBeenCalledWith(1);
    });

    it('propagates NotFoundException from the service', async () => {
      service.get.mockRejectedValue(new NotFoundException());
      await expect(controller.show({ todoListId: 999 })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('delegates to service.create with the body', async () => {
      const dto = { name: 'New List' };
      const created = { id: 1, name: 'New List' };
      service.create.mockResolvedValue(created);

      await expect(controller.create(dto)).resolves.toEqual(created);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('delegates to service.update converting the id to a number', async () => {
      const dto = { name: 'Updated List' };
      const updated = { id: 1, name: 'Updated List' };
      service.update.mockResolvedValue(updated);

      await expect(
        controller.update({ todoListId: '1' }, dto),
      ).resolves.toEqual(updated);
      expect(service.update).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('delete', () => {
    it('delegates to service.delete with the id from params', async () => {
      service.delete.mockResolvedValue(undefined);

      await expect(controller.delete({ todoListId: 1 })).resolves.toBeUndefined();
      expect(service.delete).toHaveBeenCalledWith(1);
    });
  });

  describe('markDone', () => {
    it('delegates to listItemsService.markAllDone with the id from params', async () => {
      listItemsService.markAllDone.mockResolvedValue(undefined);

      await expect(controller.markDone({ todoListId: 1 })).resolves.toBeUndefined();
      expect(listItemsService.markAllDone).toHaveBeenCalledWith(1);
    });
  });
});