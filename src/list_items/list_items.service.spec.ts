import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ListItemsService } from './list_items.service';
import { ListItem } from './list_item.entity';
import { TodoList } from '../todo_lists/todo_list.entity';

describe('ListItemsService', () => {
  let service: ListItemsService;
  let itemRepo: jest.Mocked<Record<string, jest.Mock>>;
  let listRepo: jest.Mocked<Record<string, jest.Mock>>;

  beforeEach(async () => {
    itemRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    listRepo = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListItemsService,
        { provide: getRepositoryToken(ListItem), useValue: itemRepo },
        { provide: getRepositoryToken(TodoList), useValue: listRepo },
      ],
    }).compile();

    service = module.get<ListItemsService>(ListItemsService);
  });

  describe('create', () => {
    it('creates and saves an item under a list I own', async () => {
      const dto = { value: 'Buy milk' };
      const list = { id: 1, userId: 7 };
      const saved = { id: 1, value: 'Buy milk', todoListId: 1 };
      listRepo.findOne.mockResolvedValue(list);
      itemRepo.create.mockReturnValue(saved);
      itemRepo.save.mockResolvedValue(saved);
      await expect(service.create(7, 1, dto)).resolves.toEqual(saved);
      expect(listRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1, userId: 7 },
      });
      expect(itemRepo.create).toHaveBeenCalledWith({ ...dto, todoListId: 1 });
    });

    it('throws NotFoundException when the parent list is not mine', async () => {
      listRepo.findOne.mockResolvedValue(null);
      await expect(
        service.create(7, 999, { value: 'x' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('updates an item and returns it', async () => {
      const dto = { done: true };
      const updated = { id: 1, value: 'Buy milk', todoListId: 1, done: true };
      itemRepo.update.mockResolvedValue({ affected: 1 });
      itemRepo.findOne.mockResolvedValue(updated);
      await expect(service.update(7, 1, 1, dto)).resolves.toEqual(updated);
      expect(itemRepo.update).toHaveBeenCalledWith({ id: 1, todoListId: 1 }, dto);
    });

    it('throws NotFoundException when nothing was updated', async () => {
      itemRepo.update.mockResolvedValue({ affected: 0 });
      await expect(
        service.update(7, 1, 999, { value: 'x' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('deletes an item from one of my lists', async () => {
      itemRepo.delete.mockResolvedValue({ affected: 1 });
      await expect(service.delete(7, 1, 1)).resolves.toBeUndefined();
      expect(itemRepo.delete).toHaveBeenCalledWith({ id: 1, todoListId: 1 });
    });

    it('throws NotFoundException when nothing was deleted', async () => {
      itemRepo.delete.mockResolvedValue({ affected: 0 });
      await expect(service.delete(7, 1, 999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('markAllDone', () => {
    it('bulk-updates all items of the todo list in one query', async () => {
      itemRepo.update.mockResolvedValue({ affected: 3 });
      await expect(service.markAllDone(7, 1)).resolves.toBeUndefined();
      expect(itemRepo.update).toHaveBeenCalledWith(
        { todoListId: 1 },
        { done: true },
      );
    });

    it('throws NotFoundException when the todo list has no items', async () => {
      itemRepo.update.mockResolvedValue({ affected: 0 });
      await expect(service.markAllDone(7, 999)).rejects.toThrow(NotFoundException);
    });
  });
});
