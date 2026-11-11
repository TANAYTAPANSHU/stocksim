import { createInitialState } from '../src/data/initialState';
import {
  STORAGE_KEY,
  clearPersistedState,
  extractPersistedState,
  loadPersistedState,
  savePersistedState,
  type KeyValueStorage,
  type PersistedState,
} from '../src/store/persistence';
import { reducer } from '../src/store/reducer';
import type { AppState } from '../src/types';

function fakeStorage(initial?: Record<string, string>) {
  const map = new Map<string, string>(Object.entries(initial ?? {}));
  const storage: KeyValueStorage = {
    getItem: async key => map.get(key) ?? null,
    setItem: async (key, value) => {
      map.set(key, value);
    },
    removeItem: async key => {
      map.delete(key);
    },
  };
  return { storage, map };
}

function tradedState(): AppState {
  const loggedIn = reducer(createInitialState(), {
    type: 'LOGIN',
    username: 'trader',
  });
  const bought = reducer(loggedIn, {
    type: 'PLACE_ORDER',
    id: 'ord_1',
    symbol: 'TCHN',
    side: 'BUY',
    qty: 10,
    createdAt: 1700000000000,
  });
  return reducer(bought, { type: 'TOGGLE_WATCHLIST', symbol: 'AURM' });
}

describe('extractPersistedState', () => {
  it('keeps only cash, holdings, orders and the watchlist', () => {
    const persisted = extractPersistedState(tradedState());
    expect(Object.keys(persisted).sort()).toEqual([
      'cash',
      'holdings',
      'orders',
      'watchlist',
    ]);
    expect(persisted.watchlist).toEqual(['AURM']);
    expect(persisted.orders).toHaveLength(1);
    expect(persisted.holdings.TCHN?.qty).toBe(10);
  });
});

describe('savePersistedState / loadPersistedState', () => {
  it('round-trips the account slice — a buy survives a restart', async () => {
    const { storage } = fakeStorage();
    const state = tradedState();

    await savePersistedState(extractPersistedState(state), storage);
    const loaded = await loadPersistedState(storage);

    expect(loaded).not.toBeNull();
    expect(loaded?.cash).toBe(state.cash);
    expect(loaded?.cash).toBeLessThan(100000); // the buy spent cash
    expect(loaded?.holdings).toEqual(state.holdings);
    expect(loaded?.orders).toEqual(state.orders);
    expect(loaded?.watchlist).toEqual(['AURM']);
  });

  it('restores into a fresh state without touching market data', async () => {
    const { storage } = fakeStorage();
    const state = tradedState();
    await savePersistedState(extractPersistedState(state), storage);
    const persisted = await loadPersistedState(storage);

    const fresh = createInitialState();
    const restored = reducer(fresh, {
      type: 'RESTORE',
      persisted: persisted as PersistedState,
    });

    expect(restored.cash).toBe(state.cash);
    expect(restored.holdings).toEqual(state.holdings);
    expect(restored.orders).toEqual(state.orders);
    expect(restored.watchlist).toEqual(['AURM']);
    // simulated market data comes from the fresh initial state, not storage
    expect(restored.stocks).toEqual(fresh.stocks);
    expect(restored.username).toBeNull();
  });

  it('returns null when nothing was saved', async () => {
    const { storage } = fakeStorage();
    await expect(loadPersistedState(storage)).resolves.toBeNull();
  });

  it('returns null for corrupt JSON instead of throwing', async () => {
    const { storage } = fakeStorage({ [STORAGE_KEY]: '{not json' });
    await expect(loadPersistedState(storage)).resolves.toBeNull();
  });

  it('returns null when the saved shape is wrong', async () => {
    const { storage } = fakeStorage({
      [STORAGE_KEY]: JSON.stringify({
        cash: 'lots',
        holdings: {},
        orders: [],
        watchlist: [],
      }),
    });
    await expect(loadPersistedState(storage)).resolves.toBeNull();
  });
});

describe('clearPersistedState', () => {
  it('removes the saved slice so the next load finds nothing', async () => {
    const { storage, map } = fakeStorage();
    await savePersistedState(
      extractPersistedState(tradedState()),
      storage,
    );
    expect(map.has(STORAGE_KEY)).toBe(true);

    await clearPersistedState(storage);

    expect(map.has(STORAGE_KEY)).toBe(false);
    await expect(loadPersistedState(storage)).resolves.toBeNull();
  });
});
