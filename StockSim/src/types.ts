export type Stock = {
  symbol: string;
  name: string;
  sector: string;
  price: number;
  openPrice: number;
};

export type Side = 'BUY' | 'SELL';

export type Holding = {
  symbol: string;
  qty: number;
  avgCost: number;
};

export type Order = {
  id: string;
  symbol: string;
  side: Side;
  qty: number;
  price: number;
  total: number;
  createdAt: number;
};

export type AppState = {
  username: string | null;
  cash: number;
  stocks: Record<string, Stock>;
  history: Record<string, number[]>;
  holdings: Record<string, Holding>;
  orders: Order[];
  watchlist: string[];
};
