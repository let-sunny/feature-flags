export interface Focused {
  id?: string;
  parentId?: string;
  type?: ItemType;
}
interface ItemBase {
  id: string;
  type: ItemType;
  name: string;
  visible: boolean;
}
export interface Node extends ItemBase {
  type: 'NODE';
  node: string;
}
export interface Feature extends ItemBase {
  type: 'FEATURE';
  items: Item[];
}

export type Item = Feature | Node;
export type ItemType = Item['type'];
