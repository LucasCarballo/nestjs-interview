import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TodoListsService } from './todo_lists.service';
import { TodoList } from './todo_list.entity';

describe('TodoListsService', () => {
  let service: TodoListsService;
  let repo: jest.Mocked<Record<string, jest.Mock>>;

  beforeEach(async () => {
    repo = {
      find: jest.fn(),
      findOneBy: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodoListsService,
        { provide: getRepositoryToken(TodoList), useValue: repo },
      ],
    }).compile();

    service = module.get<TodoListsService>(TodoListsService);
  });

  describe('all', () => {
    it('returns all of my todo lists', async () => {
      const lists = [{ id: 1, name: 'Shopping List', userId: 7 }];
      repo.find.mockResolvedValue(lists);
      await expect(service.all(7)).resolves.toEqual(lists);
      expect(repo.find).toHaveBeenCalledWith({ where: { userId: 7 } });
    });
  });

  describe('get', () => {
    it('returns the todo list when I own it', async () => {
      const list = { id: 1, name: 'Shopping List', userId: 7 };
      repo.findOne.mockResolvedValue(list);
      await expect(service.get(7, 1)).resolves.toEqual(list);
      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 1, userId: 7 } });
    });

    it('throws NotFoundException when the list is not mine or missing', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.get(7, 999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('creates and saves a todo list owned by me', async () => {
      const dto = { name: 'New List' };
      const saved = { id: 1, name: 'New List', userId: 7 };
      repo.create.mockReturnValue(saved);
      repo.save.mockResolvedValue(saved);
      await expect(service.create(7, dto)).resolves.toEqual(saved);
      expect(repo.create).toHaveBeenCalledWith({ name: dto.name, userId: 7 });
      expect(repo.save).toHaveBeenCalledWith(saved);
    });
  });

  describe('update', () => {
    it('updates an existing todo list and returns it', async () => {
      const dto = { name: 'Updated List' };
      const updated = { id: 1, name: 'Updated List', userId: 7 };
      repo.update.mockResolvedValue({ affected: 1 });
      repo.findOne.mockResolvedValue(updated);
      await expect(service.update(7, 1, dto)).resolves.toEqual(updated);
      expect(repo.update).toHaveBeenCalledWith({ id: 1, userId: 7 }, dto);
    });

    it('throws NotFoundException when nothing was updated', async () => {
      repo.update.mockResolvedValue({ affected: 0 });
      await expect(service.update(7, 999, { name: 'x' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('deletes one of my todo lists', async () => {
      repo.delete.mockResolvedValue({ affected: 1 });
      await expect(service.delete(7, 1)).resolves.toBeUndefined();
      expect(repo.delete).toHaveBeenCalledWith({ id: 1, userId: 7 });
    });

    it('throws NotFoundException when nothing was deleted', async () => {
      repo.delete.mockResolvedValue({ affected: 0 });
      await expect(service.delete(7, 999)).rejects.toThrow(NotFoundException);
    });
  });
});
