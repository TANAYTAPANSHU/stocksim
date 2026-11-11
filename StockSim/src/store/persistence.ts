import type { AppState, Holding, Order } from '../types';

/**
 * Persistence for the account slice of the app state.
 *
 * Only the account data is saved — cash, holdings, orders and the watchlist.
 * Prices and price history are simulated market data, so they are rebuilt by
 * createInitialState() on every launch and never stored. The storage backend
 * is injected (AppContext passes AsyncStorage) so these functions can be unit
 * tested against an in-memory fake.
 */

export const STORAGE_KEY = 'stocksim/account/v1';

export type PersistedState = {
  cash: number;
  holdings: Record<string, Holding>;
  orders: Order[];
  watchlist: string[];
};

export type KeyValueStorage = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

export function extractPersistedState(state: AppState): PersistedState {
  return {
    cash: state.cash,
    holdings: state.holdings,
    orders: state.orders,
    watchlist: state.watchlist,
  };
}

export async function savePersistedState(
  persisted: PersistedState,
  storage: KeyValueStorage,
): Promise<void> {
  await storage.setItem(STORAGE_KEY, JSON.stringify(persisted));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Load the saved account slice, or null when there is nothing saved or the
 * saved value is not shaped like a PersistedState (corrupt or written by an
 * incompatible version). Returning null makes the caller fall back to the
 * initial state instead of crashing on a bad payload.
 */
export async function loadPersistedState(
  storage: KeyValueStorage,
): Promise<PersistedState | null> {
  const raw = await storage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!isRecord(parsed)) {
    return null;
  }
  const { cash, holdings, orders, watchlist } = parsed;
  if (typeof cash !== 'number' || !Number.isFinite(cash)) {
    return null;
  }
  if (!isRecord(holdings) || !Array.isArray(orders) || !Array.isArray(watchlist)) {
    return null;
  }
  return {
    cash,
    holdings: holdings as Record<string, Holding>,
    orders: orders as Order[],
    watchlist: watchlist.filter((s): s is string => typeof s === 'string'),
  };
}

export async function clearPersistedState(
  storage: KeyValueStorage,
): Promise<void> {
  await storage.removeItem(STORAGE_KEY);
}
