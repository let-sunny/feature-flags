import { ItemType, Item, Feature, Node } from './../components/types';
export type Events = {
  changeFeatureVisible: {
    featureId: string;
  };
  renameFeature: {
    featureId: string;
    name: string;
  };
  editFeatureName: {
    featureId: string;
  };
  deleteFocusedItem: undefined;
  deleteItem: {
    id: string;
    type: ItemType;
  };
  addSelectedNodes: {
    featureId: string;
  };
  focus: {
    id: string;
    parentId: string;
    type: ItemType;
  };
  setFeature: {
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
