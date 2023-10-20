import { Api } from "@hashbranch/telegram";

export type Message = {
  date: number;
  message: string;
  id: number;
  user: Api.TypePeer | undefined;
};

export type Inventory = {
  model: string;
  hashrate: number;
  isNew?: boolean;
  moq?: number;
  doa?: number;
  price?: number;
};
