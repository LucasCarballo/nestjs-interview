import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TodoListsService } from './todo_lists.service';
import { TodoList } from './todo_list.entity';
import { ListItem } from '../list_items/list_item.entity';

describe('TodoListsService', () => {
  let service: TodoListsService;
  let todoRepo: jest.Mocked<Record<string, jest.Mock>>;
  let itemRepo: jest.Mocked<Record<string, jest.Mock>>;

  beforeEach(async () => {
    todoRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    itemRepo = {
      find: jest.fn(),
      findAndCount: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    // Default: empty QueryBuilder returning no ranked rows + no totals.
    itemRepo.createQueryBuilder.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      distinctOn: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([]),
    } as never);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodoListsService,
        { provide: getRepositoryToken(TodoList), useValue: todoRepo },
        { provide: getRepositoryToken(ListItem), useValue: itemRepo },
      ],
    }).compile();

    service = module.get<TodoListsService>(TodoListsService);
  });

  describe('all', () => {
    it('returns paginated list summaries (no items)', async () => {
      const lists = [{ id: 1, name: 'A' }, { id: 2, name: 'B' }];
      todoRepo.findAndCount.mockResolvedValue([lists, 2] as never);
      const result = await service.all(1, 10);
      expect(result.items).toHaveLength(2);
      expect(result.items[0]).toEqual({
        id: 1,
        name: 'A',
        items: [],
        totalItems: 0,
        itemsTruncated: false,
      });
      expect(result.total).toBe(2);
      expect(result.totalPages).toBe(1);
    });

    it('caps pageSize at LISTS_IN_INDEX_LIMIT', async () => {
      todoRepo.findAndCount.mockResolvedValue([[], 0] as never);
      const result = await service.all(1, 9999);
      expect(result.pageSize).toBeLessThanOrEqual(50);
    });

    it('returns an empty page when there are no lists', async () => {
      todoRepo.findAndCount.mockResolvedValue([[], 0] as never);
      const result = await service.all(1, 10);
      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.totalPages).toBe(1);
    });
  });

  describe('get', () => {
    it('returns one todo list with capped items and total counted via DB', async () => {
      const list = { id: 1, name: 'Shopping' };
      const items = Array.from({ length: 20 }, (_, i) => ({ id: i + 1, todoListId: 1 }));
      todoRepo.findOne.mockResolvedValue(list);
      itemRepo.findAndCount.mockResolvedValue([items, 47] as never);

      const result = await service.get(1);
      expect(result.totalItems).toBe(47);
      expect(result.items).toHaveLength(20);
      expect(result.itemsTruncated).toBe(true);
    });

    it('throws NotFoundException when the list is missing', async () => {
      todoRepo.findOne.mockResolvedValue(null);
      await expect(service.get(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('creates a list and returns it with totalItems=0', async () => {
      const dto = { name: 'New List' };
      const created = { id: 1, name: 'New List' };
      todoRepo.create.mockReturnValue(created);
      todoRepo.save.mockResolvedValue(created);
      const result = await service.create(dto);
      expect(result.totalItems).toBe(0);
      expect(result.itemsTruncated).toBe(false);
      expect(result.items).toEqual([]);
    });
  });

  describe('update', () => {
    it('updates an existing todo list and returns it with items + total', async () => {
      const dto = { name: 'Updated List' };
      todoRepo.update.mockResolvedValue({ affected: 1 });
      todoRepo.findOne.mockResolvedValue({ id: 1, name: 'Updated List' });
      itemRepo.findAndCount.mockResolvedValue([[], 0] as never);
      const result = await service.update(1, dto);
      expect(result.name).toBe('Updated List');
      expect(result.totalItems).toBe(0);
      expect(todoRepo.update).toHaveBeenCalledWith(1, dto);
    });

    it('throws NotFoundException when nothing was updated', async () => {
      todoRepo.update.mockResolvedValue({ affected: 0 });
      await expect(service.update(999, { name: 'x' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('deletes a todo list', async () => {
      todoRepo.delete.mockResolvedValue({ affected: 1 });
      await expect(service.delete(1)).resolves.toBeUndefined();
      expect(todoRepo.delete).toHaveBeenCalledWith(1);
    });

    it('throws NotFoundException when nothing was deleted', async () => {
      todoRepo.delete.mockResolvedValue({ affected: 0 });
      await expect(service.delete(999)).rejects.toThrow(NotFoundException);
    });
  });
});
