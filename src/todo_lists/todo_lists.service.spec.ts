import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TodoListsService } from './todo_lists.service';
import { TodoList } from './todo_list.entity';

describe('TodoListsService', () => {
  let service: TodoListsService;
  let todoRepo: jest.Mocked<Record<string, jest.Mock>>;

  beforeEach(async () => {
    todoRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodoListsService,
        { provide: getRepositoryToken(TodoList), useValue: todoRepo },
      ],
    }).compile();

    service = module.get<TodoListsService>(TodoListsService);
  });

  describe('all', () => {
    it('returns all todo lists, with items eager-loaded', async () => {
      const lists = [{ id: 1, name: 'Shopping List', items: [] }];
      todoRepo.find.mockResolvedValue(lists);
      await expect(service.all()).resolves.toEqual(lists);
      expect(todoRepo.find).toHaveBeenCalledWith({ relations: ['items'] });
    });
  });

  describe('get', () => {
    it('returns one todo list with items eager-loaded', async () => {
      const list = { id: 1, name: 'Shopping List', items: [] };
      todoRepo.findOne.mockResolvedValue(list);
      await expect(service.get(1)).resolves.toEqual(list);
      expect(todoRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['items'],
      });
    });

    it('throws NotFoundException when the list is missing', async () => {
      todoRepo.findOne.mockResolvedValue(null);
      await expect(service.get(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('creates a list and returns it with an empty items array', async () => {
      const dto = { name: 'New List' };
      const created = { id: 1, name: 'New List' };
      todoRepo.create.mockReturnValue(created);
      todoRepo.save.mockResolvedValue(created);
      const result = await service.create(dto);
      expect(result).toEqual({ ...created, items: [] });
      expect(todoRepo.create).toHaveBeenCalledWith({ name: dto.name });
      expect(todoRepo.save).toHaveBeenCalledWith(created);
    });
  });

  describe('update', () => {
    it('updates an existing todo list and returns it with items', async () => {
      const dto = { name: 'Updated List' };
      const updated = { id: 1, name: 'Updated List', items: [] };
      todoRepo.update.mockResolvedValue({ affected: 1 });
      todoRepo.findOne.mockResolvedValue(updated);
      await expect(service.update(1, dto)).resolves.toEqual(updated);
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
