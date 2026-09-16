import { Test, TestingModule } from '@nestjs/testing';
import { ListItemsController } from './list_items.controller';
import { ListItemsService } from './list_items.service';
import { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ListItem } from './list_item.entity';

describe('ListItemsController', () => {
  let app: INestApplication;
  let listItemsController: ListItemsController;
  let listItemRepositoryMock: jest.Mocked<Record<string, jest.Mock>>;

  beforeEach(async () => {
    listItemRepositoryMock = {
      find: jest.fn(),
      findOneBy: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ListItemsController],
      providers: [
        ListItemsService,
        {
          provide: getRepositoryToken(ListItem),
          useValue: listItemRepositoryMock,
        },
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    listItemsController = module.get<ListItemsController>(ListItemsController);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('index', () => {
    it('should return all list items for a todo list', async () => {
      const mockItems = [
        { id: 1, value: 'Buy milk', todoListId: 1 },
        { id: 2, value: 'Buy eggs', todoListId: 1 },
      ];

      listItemRepositoryMock.find.mockResolvedValue(mockItems);

      const result = await listItemsController.index({ todoListId: 1 });

      expect(result).toEqual(mockItems);
    });
  });

  describe('show', () => {
    it('should return a single list item by id', async () => {
      const mockItem = { id: 1, value: 'Buy milk', todoListId: 1 };
      listItemRepositoryMock.findOneBy.mockResolvedValue(mockItem);

      const result = await listItemsController.show({
        todoListId: 1,
        listItemId: 1,
      });

      expect(result).toEqual(mockItem);
    });
  });

  describe('create', () => {
    it('should create a new list item under a todo list', async () => {
      const createDto = { value: 'Buy milk' };
      const mockCreated = { id: 1, value: 'Buy milk', todoListId: 1 };

      listItemRepositoryMock.create.mockReturnValue(mockCreated);
      listItemRepositoryMock.save.mockResolvedValue(mockCreated);

      const result = await listItemsController.create(
        { todoListId: 1 },
        createDto,
      );

      expect(result).toEqual(mockCreated);
    });
  });

  describe('update', () => {
    it('should update an existing list item', async () => {
      const updateDto = { value: 'Buy oat milk' };
      const updatedItem = { id: 1, value: 'Buy oat milk', todoListId: 1 };

      listItemRepositoryMock.save.mockResolvedValue(updatedItem);

      const result = await listItemsController.update(
        { todoListId: 1, listItemId: '1' },
        updateDto,
      );

      expect(result).toEqual(updatedItem);
    });
  });

  describe('delete', () => {
    it('should delete a list item', async () => {
      listItemRepositoryMock.delete.mockResolvedValue({ affected: 1 });

      await listItemsController.delete({ todoListId: 1, listItemId: 1 });

      expect(listItemRepositoryMock.delete).toHaveBeenCalledWith({
        id: 1,
        todoListId: 1,
      });
    });
  });
});
