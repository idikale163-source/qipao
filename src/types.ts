export type QuadrantValues = [number, number, number, number]; // [top, right, bottom, left]

export type ActiveRole = 'ai' | 'user';
export type ActiveComponent = 'bubble' | 'voice' | 'transfer';
export type ActiveComp = ActiveComponent;
export type ActiveMode = 's' | 'c'; // 's': slice (red), 'c': content padding (green)
export type ExportType = 'sully' | 'link';
export type ModalAssetStrategy = 'ai' | 'user' | 'smart' | 'none';

export interface ComponentConfig {
  url: string;
  slice: QuadrantValues;
  pad: QuadrantValues;
  patternScale: number;
  dirty?: boolean; // if false, automatically follows bubble settings
}

export interface RoleConfig {
  url: string;
  slice: QuadrantValues;
  pad: QuadrantValues;
  patternScale: number;
  textColor: string;
  voice: ComponentConfig;
  transfer: ComponentConfig;
}

export interface AppConfig {
  ai: RoleConfig;
  user: RoleConfig;
  modalStrategy: ModalAssetStrategy;
}
