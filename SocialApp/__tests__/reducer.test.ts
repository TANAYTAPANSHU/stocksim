import { createInitialState, STARTING_CASH } from '../src/data/initialState';
import { reducer } from '../src/store/reducer';
import {
  changePct,
  holdingsValue,
  totalEquity,
  unrealizedPnl,
  validateOrder,
} from '../src/store/selectors';
import type { AppState } from '../src/types';

function loggedIn(): AppState {
  return reducer(createInitialState(), { type: 'LOGIN', username: 'trader' });
}

function buy(state: AppState, symbol: string, qty: number): AppState {
  return reducer(state, {
    type: 'PLACE_ORDER',
    id: `o_${Math.random()}`,
    symbol,
    side: 'BUY',
    qty,
    createdAt: 0,
  });
}

function sell(state: AppState, symbol: string, qty: number): AppState {
  return reducer(state, {
    type: 'PLACE_ORDER',
    id: `o_${Math.random()}`,
    symbol,
    side: 'SELL',
    qty,
    createdAt: 0,
  });
}

describe('login', () => {
  test('login sets the username and logout clears it', () => {
    const state = loggedIn();
    expect(state.username).toBe('trader');
    expect(reducer(state, { type: 'LOGOUT' }).username).toBeNull();
  });
});

describe('prices', () => {
  test('price update changes the price and appends to history', () => {
    const before = createInitialState();
    const state = reducer(before, { type: 'PRICES_UPDATED', factors: { TCHN: 1.01 } });
    expect(state.stocks.TCHN.price).toBeCloseTo(416.63, 1);
    expect(state.history.TCHN).toHaveLength(2);
    expect(state.stocks.TCHN.openPrice).toBe(before.stocks.TCHN.openPrice);
  });

  test('history is capped to its maximum length', () => {
    let state = createInitialState();
    for (let i = 0; i < 100; i += 1) {
      state = reducer(state, { type: 'PRICES_UPDATED', factors: { FOOD: 1.001 } });
    }
    expect(state.history.FOOD.length).toBeLessThanOrEqual(40);
  });
});

describe('buying', () => {
  test('buy reduces cash, adds a holding and records an order', () => {
    const state = buy(loggedIn(), 'BLBK', 10);
    expect(state.cash).toBeCloseTo(STARTING_CASH - 964, 2);
    expect(state.holdings.BLBK).toMatchObject({ qty: 10, avgCost: 96.4 });
    expect(state.orders[0]).toMatchObject({ side: 'BUY', symbol: 'BLBK', qty: 10, total: 964 });
  });

  test('buying more of the same stock averages the cost', () => {
    let state = buy(loggedIn(), 'BLBK', 10);
    state = reducer(state, { type: 'PRICES_UPDATED', factors: { BLBK: 1.1 } });
    state = buy(state, 'BLBK', 10);
    expect(state.holdings.BLBK.qty).toBe(20);
    expect(state.holdings.BLBK.avgCost).toBeCloseTo((964 + 1060.4) / 20, 1);
  });

  test('buy is rejected when cash is not enough', () => {
    const state = loggedIn();
    const next = buy(state, 'TCHN', 1000);
    expect(next).toBe(state);
  });

  test('buy is rejected when not logged in', () => {
    const state = createInitialState();
    expect(buy(state, 'TCHN', 1)).toBe(state);
  });
});

describe('selling', () => {
  test('partial sell reduces the holding and returns cash', () => {
    let state = buy(loggedIn(), 'AURM', 10);
    state = sell(state, 'AURM', 4);
    expect(state.holdings.AURM.qty).toBe(6);
    expect(state.cash).toBeCloseTo(STARTING_CASH - 1882 + 752.8, 2);
  });

  test('selling everything removes the holding', () => {
    let state = buy(loggedIn(), 'AURM', 5);
    state = sell(state, 'AURM', 5);
    expect(state.holdings.AURM).toBeUndefined();
  });

  test('selling more than you hold is rejected', () => {
    const state = buy(loggedIn(), 'AURM', 2);
    expect(sell(state, 'AURM', 3)).toBe(state);
  });
});

describe('validation', () => {
  test('rejects zero, negative and fractional quantities', () => {
    const state = loggedIn();
    expect(validateOrder(state, 'BUY', 'TCHN', 0)).toMatch(/whole number/);
    expect(validateOrder(state, 'BUY', 'TCHN', -2)).toMatch(/whole number/);
    expect(validateOrder(state, 'BUY', 'TCHN', 1.5)).toMatch(/whole number/);
  });

  test('accepts a valid buy', () => {
    expect(validateOrder(loggedIn(), 'BUY', 'TCHN', 2)).toBeNull();
  });
});

describe('watchlist', () => {
  test('toggle adds and removes a symbol', () => {
    const added = reducer(loggedIn(), { type: 'TOGGLE_WATCHLIST', symbol: 'PHRM' });
    expect(added.watchlist).toEqual(['PHRM']);
    const removed = reducer(added, { type: 'TOGGLE_WATCHLIST', symbol: 'PHRM' });
    expect(removed.watchlist).toEqual([]);
  });
});

describe('portfolio maths', () => {
  test('equity is cash plus holdings at current price', () => {
    let state = buy(loggedIn(), 'SOLR', 100);
    state = reducer(state, { type: 'PRICES_UPDATED', factors: { SOLR: 1.1 } });
    expect(holdingsValue(state)).toBeCloseTo(state.stocks.SOLR.price * 100, 1);
    expect(totalEquity(state)).toBeCloseTo(state.cash + holdingsValue(state), 1);
  });

  test('unrealized P&L compares price with average cost', () => {
    const state = buy(loggedIn(), 'SOLR', 100);
    const holding = state.holdings.SOLR;
    const stock = { ...state.stocks.SOLR, price: 25.1 };
    expect(unrealizedPnl(holding, stock)).toBeCloseTo((25.1 - 23.1) * 100, 1);
  });

  test('change percent is measured from the open price', () => {
    const stock = { ...createInitialState().stocks.GRNE, price: 63.58 };
    expect(changePct(stock)).toBeCloseTo(10, 1);
  });
});
