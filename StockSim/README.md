# StockSim

A practice stock trading app built with **React Native 0.88** and **TypeScript**. Every account starts with virtual cash, prices update live, and you can buy and sell shares, track a watchlist and watch your portfolio P&L.

> StockSim is for learning and demos only. Companies, tickers and prices are fictional and simulated. It is not connected to any real market or broker.

## Features

| Area | What you can do |
| --- | --- |
| Login | Pick a username. No password is needed for this demo. A new username creates an account with ₹1,00,000 of virtual cash. |
| Markets | Browse 8 stocks with live prices and day change %. Search by symbol or company name. |
| Stock detail | See price, open price, day change, a bar chart of recent prices, and the watchlist toggle. |
| Trading | Buy or sell whole shares. Validation blocks orders with too little cash, too few shares, or an invalid quantity. |
| Watchlist | Keep the stocks you follow in one place. |
| Portfolio | Total equity, cash, holdings value, invested amount and unrealized P&L, with P&L for each holding. |
| Orders | Full history of your trades, with price, quantity, total and time. |
| Account | See your username and log out. |

## Tech stack

- React Native 0.88 (bare workflow, no Expo)
- React 19.3 with TypeScript
- React Navigation: native stack and bottom tabs
- `react-native-screens` and `react-native-safe-area-context`
- Jest for unit tests

## How it works

- **Simulated market.** `AppContext` runs a timer every 2 seconds. Each stock moves by up to ±1%. Prices are kept in memory.
- **Pure state logic.** All state changes live in `src/store/reducer.ts`. The reducer takes IDs and timestamps from the action, so it is deterministic and easy to test.
- **Shared rules.** `src/store/selectors.ts` holds the order validation and portfolio maths. The UI and the reducer both use `validateOrder`, so they always agree.
- **Data is in memory.** Restarting the app resets the portfolio.

## Project structure

```
StockSim/
├── App.tsx                      # Providers and root navigation
├── src/
│   ├── components/              # StockRow, Sparkline
│   ├── data/initialState.ts     # Fictional stocks, starting cash, initial state
│   ├── navigation/              # Stack and tab navigators, param types
│   ├── screens/                 # Login, Markets, Watchlist, Portfolio, Orders, Account, StockDetail
│   ├── store/
│   │   ├── AppContext.tsx       # State provider and simulated price ticks
│   │   ├── reducer.ts           # Pure state transitions
│   │   └── selectors.ts         # Validation and P&L maths
│   ├── theme.ts                 # Colours and spacing
│   ├── types.ts                 # Shared types
│   └── utils/format.ts          # Money, percentage and time formatting
├── __tests__/reducer.test.ts    # Reducer, validation and portfolio tests
├── android/                     # Android native project
└── ios/                         # iOS native project (Xcode workspace, Podfile)
```

## Getting started

### Requirements

- Node.js 22 or newer
- Xcode 26 or newer, for the iOS app
- CocoaPods
- macOS, for the iOS Simulator

### Install

```bash
npm install
cd ios && pod install && cd ..
```

### Run

Start Metro in one terminal:

```bash
npm start
```

Then run the app in another terminal:

```bash
npm run ios
```

For Android, run `npm run android` with an emulator or device connected.

### Test

```bash
npm test
```

The test suite covers login, buying and selling (including average cost), validation, watchlist, and the portfolio maths. It currently has 16 passing tests.

## Known limitations

- Single demo portfolio. Logging out keeps the portfolio, and logging in as a different user uses the same one.
- No persistence. The portfolio resets when the app restarts.
- Prices are random and simulated, so they do not follow any real market.
- The native app name and bundle identifiers were renamed from the original template, so run `pod install` again after cloning.

## Roadmap

This repo is also a proof of concept for two tools:

- **agent-device POC:** let an AI coding agent tap, scroll and read the accessibility tree of the running StockSim app.
- **native-sim POC:** stream the iOS Simulator from a GitHub-hosted macOS runner to a browser, so the app can be previewed without a local Mac.

Both POCs are planned and not built yet.
