import { ListItem } from "./list_item.interface";

export interface TodoList {
  id: number;
  name: string;
  items: Array<ListItem>;
}