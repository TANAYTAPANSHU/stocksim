import type { AppState, Holding, Stock, Side } from '../types';

export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

// Percent change from the day's open price.
export function changePct(stock: Stock): number {
  if (stock.openPrice === 0) return 0;
  return ((stock.price - stock.openPrice) / stock.openPrice) * 100;
}

export function holdingsValue(state: AppState): number {
  return round2(
    Object.values(state.holdings).reduce((sum, h) => {
      const stock = state.stocks[h.symbol];
      return sum + (stock ? stock.price * h.qty : 0);
    }, 0),
  );
}

export function totalEquity(state: AppState): number {
  return round2(state.cash + holdingsValue(state));
}

// Profit or loss on a holding compared with its average cost.
export function unrealizedPnl(holding: Holding, stock: Stock): number {
  return round2((stock.price - holding.avgCost) * holding.qty);
}

// Returns an error message, or null when the order can go through.
export function validateOrder(
  state: AppState,
  side: Side,
  symbol: string,
  qty: number,
): string | null {
  if (!state.username) return 'Please log in first.';
  if (!Number.isInteger(qty) || qty <= 0) return 'Quantity must be a whole number above 0.';

  const stock = state.stocks[symbol];
  if (!stock) return 'Unknown stock.';

  const total = round2(stock.price * qty);
  if (side === 'BUY' && total > state.cash) {
    return 'Not enough cash for this order.';
  }
  if (side === 'SELL') {
    const owned = state.holdings[symbol]?.qty ?? 0;
    if (qty > owned) return `You only hold ${owned} share${owned === 1 ? '' : 's'}.`;
  }
  return null;
}
