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
    it('returns all todo lists', async () => {
      const lists = [{ id: 1, name: 'Shopping List' }];
      repo.find.mockResolvedValue(lists);
      await expect(service.all()).resolves.toEqual(lists);
      expect(repo.find).toHaveBeenCalledWith();
    });
  });

  describe('get', () => {
    it('returns the todo list when it exists', async () => {
      const list = { id: 1, name: 'Shopping List' };
      repo.findOneBy.mockResolvedValue(list);
      await expect(service.get(1)).resolves.toEqual(list);
      expect(repo.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });

    it('throws NotFoundException when it does not exist', async () => {
      repo.findOneBy.mockResolvedValue(null);
      await expect(service.get(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('creates and saves a todo list', async () => {
      const dto = { name: 'New List' };
      const saved = { id: 1, name: 'New List' };
      repo.create.mockReturnValue(saved);
      repo.save.mockResolvedValue(saved);
      await expect(service.create(dto)).resolves.toEqual(saved);
      expect(repo.create).toHaveBeenCalledWith(dto);
      expect(repo.save).toHaveBeenCalledWith(saved);
    });
  });

  describe('update', () => {
    it('updates an existing todo list and returns it', async () => {
      const dto = { name: 'Updated List' };
      const updated = { id: 1, name: 'Updated List' };
      repo.update.mockResolvedValue({ affected: 1 });
      repo.findOneBy.mockResolvedValue(updated);
      await expect(service.update(1, dto)).resolves.toEqual(updated);
      expect(repo.update).toHaveBeenCalledWith(1, dto);
    });

    it('throws NotFoundException when nothing was updated', async () => {
      repo.update.mockResolvedValue({ affected: 0 });
      await expect(service.update(999, { name: 'x' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('deletes an existing todo list', async () => {
      repo.delete.mockResolvedValue({ affected: 1 });
      await expect(service.delete(1)).resolves.toBeUndefined();
      expect(repo.delete).toHaveBeenCalledWith(1);
    });

    it('throws NotFoundException when nothing was deleted', async () => {
      repo.delete.mockResolvedValue({ affected: 0 });
      await expect(service.delete(999)).rejects.toThrow(NotFoundException);
    });
  });
});