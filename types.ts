
export enum AccessoryType {
  Ring = 'Anel',
  Earring = 'Brinco',
  Necklace = 'Colar',
  Choker = 'Choker',
  Bracelet = 'Pulseira',
}

export interface Accessory {
  name: string;
  type: AccessoryType;
  imageUrl: string;
}
