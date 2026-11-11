import { HISTORY_LENGTH } from '../data/initialState';
import type { PersistedState } from './persistence';
import type { AppState, Holding, Order, Side } from '../types';
import { round2, validateOrder } from './selectors';

export type Action =
  | { type: 'LOGIN'; username: string }
  | { type: 'LOGOUT' }
  | { type: 'PRICES_UPDATED'; factors: Record<string, number> }
  | {
      type: 'PLACE_ORDER';
      id: string;
      symbol: string;
      side: Side;
      qty: number;
      createdAt: number;
    }
  | { type: 'TOGGLE_WATCHLIST'; symbol: string }
  | { type: 'RESTORE'; persisted: PersistedState };

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, username: action.username.trim() };

    case 'LOGOUT':
      return { ...state, username: null };

    case 'RESTORE':
      // Hydrate the persisted account slice over the freshly built state;
      // market data (stocks, history) keeps its initial values.
      return {
        ...state,
        cash: action.persisted.cash,
        holdings: action.persisted.holdings,
        orders: action.persisted.orders,
        watchlist: action.persisted.watchlist,
      };

    case 'PRICES_UPDATED': {
      const stocks = { ...state.stocks };
      const history = { ...state.history };
      for (const [symbol, factor] of Object.entries(action.factors)) {
        const stock = stocks[symbol];
        if (!stock) continue;
        const price = Math.max(0.01, round2(stock.price * factor));
        stocks[symbol] = { ...stock, price };
        history[symbol] = [...(history[symbol] ?? []), price].slice(-HISTORY_LENGTH);
      }
      return { ...state, stocks, history };
    }

    case 'PLACE_ORDER': {
      if (validateOrder(state, action.side, action.symbol, action.qty)) {
        return state;
      }
      const stock = state.stocks[action.symbol];
      const price = stock.price;
      const total = round2(price * action.qty);
      const holdings = { ...state.holdings };
      let cash = state.cash;

      if (action.side === 'BUY') {
        const current: Holding | undefined = holdings[action.symbol];
        const oldQty = current?.qty ?? 0;
        const oldCost = current ? current.avgCost * oldQty : 0;
        const newQty = oldQty + action.qty;
        holdings[action.symbol] = {
          symbol: action.symbol,
          qty: newQty,
          avgCost: round2((oldCost + total) / newQty),
        };
        cash = round2(cash - total);
      } else {
        const current = holdings[action.symbol];
        const remaining = current.qty - action.qty;
        if (remaining === 0) {
          delete holdings[action.symbol];
        } else {
          holdings[action.symbol] = { ...current, qty: remaining };
        }
        cash = round2(cash + total);
      }

      const order: Order = {
        id: action.id,
        symbol: action.symbol,
        side: action.side,
        qty: action.qty,
        price,
        total,
        createdAt: action.createdAt,
      };

      return {
        ...state,
        cash,
        holdings,
        orders: [order, ...state.orders],
      };
    }

    case 'TOGGLE_WATCHLIST': {
      const isWatched = state.watchlist.includes(action.symbol);
      return {
        ...state,
        watchlist: isWatched
          ? state.watchlist.filter(s => s !== action.symbol)
          : [...state.watchlist, action.symbol],
      };
    }

    default:
      return state;
  }
}
