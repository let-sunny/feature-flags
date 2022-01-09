export interface Node {
  id: string;
  node: string;
  type: 'NODE';
  name: string;
  visible: boolean;
}
export interface Feature {
  id: string;
  name: string;
  type: 'FEATURE';
  visible: boolean;
  items: Item[];
}
export type Item = Feature | Node;
export type ItemType = Feature['type'] | Node['type'];
