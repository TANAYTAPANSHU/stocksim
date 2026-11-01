# StockSim: sample stock trading app

A practice trading app built with bare React Native 0.88 and TypeScript. Every user starts with
virtual cash. Stock prices are simulated and fictional, so this is not real market data and not a
real brokerage.

## Features

- **Login:** username only, no password. Demo use only.
- **Markets:** list of stocks with live-updating prices and daily change %, with search.
- **Stock detail:** price, day change, price history chart, add to or remove from watchlist.
- **Trading:** buy and sell whole shares. Validation covers cash limits, shares owned and
  whole-number quantities.
- **Watchlist:** stocks you are following.
- **Portfolio:** total equity, cash, holdings value, invested amount and unrealized P&L, with
  per-holding P&L against average cost.
- **Orders:** history of every trade.
- **Account:** log out.

## Project layout

- `src/data/initialState.ts`: fictional stocks and starting cash.
- `src/store/reducer.ts`: pure state transitions (login, prices, orders, watchlist).
- `src/store/selectors.ts`: order validation and portfolio maths.
- `src/store/AppContext.tsx`: holds state and simulates a price tick every 2 seconds.
- `src/screens/`: one file per screen.
- `__tests__/reducer.test.ts`: unit tests for the reducer and selectors.

## Running

```bash
npm install
cd ios && pod install && cd ..
npx react-native start
npx react-native run-ios
```

Run the unit tests with:

```bash
npm test
```

## Notes

- Data lives in memory. Restarting the app resets the portfolio.
- The app name is still `SocialApp` in `package.json` and native projects.
