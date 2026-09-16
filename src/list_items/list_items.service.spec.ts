import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ListItemsService } from './list_items.service';
import { ListItem } from './list_item.entity';

describe('ListItemsService', () => {
  let service: ListItemsService;
  let repo: jest.Mocked<Record<string, jest.Mock>>;

  beforeEach(async () => {
    repo = {
      find: jest.fn(),
      findOneBy: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListItemsService,
        { provide: getRepositoryToken(ListItem), useValue: repo },
      ],
    }).compile();

    service = module.get<ListItemsService>(ListItemsService);
  });

  describe('all', () => {
    it('returns all items of a todo list', async () => {
      const items = [{ id: 1, value: 'Buy milk', todoListId: 1 }];
      repo.find.mockResolvedValue(items);
      await expect(service.all(1)).resolves.toEqual(items);
      expect(repo.find).toHaveBeenCalledWith({ where: { todoListId: 1 } });
    });
  });

  describe('get', () => {
    it('returns the item when it exists', async () => {
      const item = { id: 1, value: 'Buy milk', todoListId: 1 };
      repo.findOneBy.mockResolvedValue(item);
      await expect(service.get(1, 1)).resolves.toEqual(item);
      expect(repo.findOneBy).toHaveBeenCalledWith({ id: 1, todoListId: 1 });
    });

    it('throws NotFoundException when it does not exist', async () => {
      repo.findOneBy.mockResolvedValue(null);
      await expect(service.get(1, 999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('creates and saves an item under the todo list', async () => {
      const dto = { value: 'Buy milk' };
      const saved = { id: 1, value: 'Buy milk', todoListId: 1 };
      repo.create.mockReturnValue(saved);
      repo.save.mockResolvedValue(saved);
      await expect(service.create(1, dto)).resolves.toEqual(saved);
      expect(repo.create).toHaveBeenCalledWith({ ...dto, todoListId: 1 });
    });
  });

  describe('update', () => {
    it('updates an existing item and returns it', async () => {
      const dto = { value: 'Buy oat milk' };
      const updated = { id: 1, value: 'Buy oat milk', todoListId: 1 };
      repo.update.mockResolvedValue({ affected: 1 });
      repo.findOneBy.mockResolvedValue(updated);
      await expect(service.update(1, 1, dto)).resolves.toEqual(updated);
      expect(repo.update).toHaveBeenCalledWith({ id: 1, todoListId: 1 }, dto);
    });

    it('throws NotFoundException when nothing was updated', async () => {
      repo.update.mockResolvedValue({ affected: 0 });
      await expect(service.update(1, 999, { value: 'x' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('deletes an existing item', async () => {
      repo.delete.mockResolvedValue({ affected: 1 });
      await expect(service.delete(1, 1)).resolves.toBeUndefined();
      expect(repo.delete).toHaveBeenCalledWith({ id: 1, todoListId: 1 });
    });

    it('throws NotFoundException when nothing was deleted', async () => {
      repo.delete.mockResolvedValue({ affected: 0 });
      await expect(service.delete(1, 999)).rejects.toThrow(NotFoundException);
    });
  });
});