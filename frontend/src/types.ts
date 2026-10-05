export interface Type {
  typeId: number;
  name: string;
  _count?: {
    menus: number;
  };
}

export interface Menu {
  menuId: number;
  name: string;
  price: number;
  isBestSeller: boolean;
  typeId: number;
  type?: Type;
}
