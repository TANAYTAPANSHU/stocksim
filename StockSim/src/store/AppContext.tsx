import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react';
import { SYMBOLS, createInitialState } from '../data/initialState';
import type { AppState, Side } from '../types';
import {
  clearPersistedState,
  extractPersistedState,
  loadPersistedState,
  savePersistedState,
  type PersistedState,
} from './persistence';
import { reducer } from './reducer';

// Simulated market: every tick moves each price by up to 1% either way.
const TICK_MS = 2000;
const MAX_MOVE = 0.01;

type AppContextValue = {
  state: AppState;
  login: (username: string) => void;
  logout: () => void;
  placeOrder: (side: Side, symbol: string, qty: number) => void;
  toggleWatchlist: (symbol: string) => void;
  resetAccount: () => void;
};

const AppContext = createContext<AppContextValue | null>(null);

let counter = 0;
function newId(prefix: string): string {
  counter += 1;
  return `${prefix}_${Date.now().toString(36)}${counter.toString(36)}`;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);
  // True once the saved account slice has been loaded (or found absent).
  // Saves are gated on it so the initial state can never overwrite the
  // saved portfolio before the load has had a chance to restore it.
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadPersistedState(AsyncStorage)
      .then(persisted => {
        if (cancelled) {
          return;
        }
        if (persisted) {
          dispatch({ type: 'RESTORE', persisted });
        }
        setHydrated(true);
      })
      .catch(() => {
        if (!cancelled) {
          setHydrated(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const persistedSlice = useMemo<PersistedState>(
    () => extractPersistedState(state),
    // extractPersistedState reads exactly these four fields.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.cash, state.holdings, state.orders, state.watchlist],
  );

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    savePersistedState(persistedSlice, AsyncStorage).catch(() => {
      // A failed save (e.g. storage full) must not break trading; the next
      // account change retries with the then-current slice.
    });
  }, [hydrated, persistedSlice]);

  useEffect(() => {
    const timer = setInterval(() => {
      const factors: Record<string, number> = {};
      for (const symbol of SYMBOLS) {
        factors[symbol] = 1 + (Math.random() * 2 - 1) * MAX_MOVE;
      }
      dispatch({ type: 'PRICES_UPDATED', factors });
    }, TICK_MS);
    return () => clearInterval(timer);
  }, []);

  const login = useCallback((username: string) => {
    dispatch({ type: 'LOGIN', username });
  }, []);

  const logout = useCallback(() => dispatch({ type: 'LOGOUT' }), []);

  const placeOrder = useCallback((side: Side, symbol: string, qty: number) => {
    dispatch({
      type: 'PLACE_ORDER',
      id: newId('ord'),
      symbol,
      side,
      qty,
      createdAt: Date.now(),
    });
  }, []);

  const toggleWatchlist = useCallback((symbol: string) => {
    dispatch({ type: 'TOGGLE_WATCHLIST', symbol });
  }, []);

  const resetAccount = useCallback(() => {
    clearPersistedState(AsyncStorage).catch(() => {});
    dispatch({
      type: 'RESTORE',
      persisted: extractPersistedState(createInitialState()),
    });
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({ state, login, logout, placeOrder, toggleWatchlist, resetAccount }),
    [state, login, logout, placeOrder, toggleWatchlist, resetAccount],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used inside AppProvider');
  }
  return ctx;
}
