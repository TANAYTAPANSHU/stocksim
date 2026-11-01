# StockSim

A practice stock trading app built with React Native and TypeScript, plus planned proofs of concept for AI-driven iOS testing.

## What is in this repo

| Path | Description |
| --- | --- |
| [StockSim/](StockSim/) | The React Native app: virtual cash, simulated live prices, buy and sell, watchlist, portfolio P&L and order history. |
| [StockSim/README.md](StockSim/README.md) | Full app documentation: features, project structure, setup, running and tests. |

Branch `main` holds only the initial empty commit. The app lives on `stock-trading-app`.

## Quick start

```bash
cd StockSim
npm install
cd ios && pod install && cd ..
npm start
npm run ios
```

Run the unit tests with `npm test` from the `StockSim` folder.

## Planned proofs of concept

- **agent-device:** let an AI coding agent drive the running app. It can tap, scroll and read the accessibility tree.
- **native-sim:** stream the iOS Simulator from a GitHub-hosted macOS runner to a browser.

Both are planned and not built yet.

## Disclaimer

All stocks, companies and prices in this app are fictional and simulated. The app is for learning and demos only and is not connected to any real market.
