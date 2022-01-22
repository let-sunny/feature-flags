import { ItemType, Item, Feature, Node } from './../components/types';
export type Events = {
  changeFeatureVisible: {
    id: string;
    visible: boolean;
  };
  renameFeature: {
    id: string;
    name: string;
  };
  editFocusedFeatureName: undefined;
  editFeatureName: {
    id: string;
  };
  deleteFocusedItem: undefined;
  deleteItem: {
    id: string;
    type: ItemType;
  };
  addSelectedNodesToFeature: {
    id: string;
  };
  focus: {
    id: string;
    parentId: string;
    type: ItemType;
  };
  setFeatures: {
    features: Feature[];
  };
  setSelectionNodes: {
    nodes: Node[];
  };
  syncFeatures: undefined;
  changeNodeVisible: {
    nodes: Item[];
    visible: boolean;
  };
  updateFeatures: {
    features: Feature[];
  };
  openContextMenu: {
    target: HTMLElement;
    position: {
      x: number;
      y: number;
    };
  };
  closeContextMenu: undefined;
};
