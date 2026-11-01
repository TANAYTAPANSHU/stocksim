import type { AppState, Stock } from '../types';

// Demo market. These are fictional companies and prices, not real market data.
export const STARTING_CASH = 100000;
export const HISTORY_LENGTH = 40;

const SEED_STOCKS: Stock[] = [
  { symbol: 'TCHN', name: 'Techno Labs', sector: 'Technology', price: 412.5, openPrice: 412.5 },
  { symbol: 'AURM', name: 'Aurora Motors', sector: 'Auto', price: 188.2, openPrice: 188.2 },
  { symbol: 'BLBK', name: 'Blue Bank Corp', sector: 'Finance', price: 96.4, openPrice: 96.4 },
  { symbol: 'GRNE', name: 'Green Energy Co', sector: 'Energy', price: 57.8, openPrice: 57.8 },
  { symbol: 'SOLR', name: 'Solar Dynamics', sector: 'Energy', price: 23.1, openPrice: 23.1 },
  { symbol: 'PHRM', name: 'PharmaCure', sector: 'Healthcare', price: 135, openPrice: 135 },
  { symbol: 'RETL', name: 'RetailHub', sector: 'Consumer', price: 74.3, openPrice: 74.3 },
  { symbol: 'FOOD', name: 'FreshFoods', sector: 'Consumer', price: 41.7, openPrice: 41.7 },
];

export const SYMBOLS = SEED_STOCKS.map(s => s.symbol);

export function createInitialState(): AppState {
  const stocks: Record<string, Stock> = {};
  const history: Record<string, number[]> = {};
  for (const stock of SEED_STOCKS) {
    stocks[stock.symbol] = { ...stock };
    history[stock.symbol] = [stock.price];
  }
  return {
    username: null,
    cash: STARTING_CASH,
    stocks,
    history,
    holdings: {},
    orders: [],
    watchlist: [],
  };
}
