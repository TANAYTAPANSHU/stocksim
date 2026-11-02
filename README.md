# StockSim

StockSim is a practice stock trading app built with **React Native 0.88** and **TypeScript**. It is a small but complete mobile app. Users log in with a username, watch eight fictional stocks whose prices move every few seconds, and buy or sell shares. Each order is checked for enough cash, enough shares and a whole-number quantity. Favourite stocks go into a watchlist, the portfolio shows total equity and profit or loss per holding, and every trade is recorded in an order history.

This repository is also a working proof of concept for automated, cloud-ready mobile testing:

- **agent-device smoke test:** an end-to-end test that drives the app like a user. It finds buttons and fields by their accessibility labels, logs in, buys one share and checks the portfolio. It runs on a local simulator, or on a cloud simulator through the agent-device proxy.
- **native-sim cloud preview:** builds the app on a GitHub-hosted macOS runner and streams the iOS Simulator to a browser, so a reviewer can see a running build without owning a Mac.
- **Continuous integration:** the type check, lint and unit tests run on every push. The iOS smoke test runs on every pull request.

## Demo

- [Local smoke test recording](StockSim/docs/media/smoke-local.mp4): the full test on a local iOS 26.5 simulator (iPhone 17 Pro).
- [Cloud smoke test recording](StockSim/docs/media/smoke-cloud.mp4): the same test on a GitHub macOS runner, streamed through native-sim.
- [Screen recording, 2 November 2026](StockSim/docs/media/screen-recording-2026-11-02.mov): a screen recording of the app flow, captured on a Mac.

## What is in this repo

| Path | Description |
| --- | --- |
| [StockSim/](StockSim/) | The React Native app, its unit tests, the smoke test and the CI workflows' app code. |
| [StockSim/README.md](StockSim/README.md) | Full app documentation: features, project structure, testing and smoke test details. |
| [StockSim/docs/SETUP.md](StockSim/docs/SETUP.md) | Step-by-step installation guide, from a fresh Mac to a running app, with troubleshooting. |
| [.github/workflows/](.github/workflows/) | `ci.yml` (checks on every push) and `smoke-ios.yml` (iOS smoke test on pull requests), plus the native-sim workflow. |

Branch `main` holds only the initial empty commit. The app lives on `stock-trading-app`, which is proposed for merge in pull request #1.

## Quick start

```bash
cd StockSim
npm install
cd ios && pod install && cd ..
npm start
npm run ios
```

Run the unit tests with `npm test`, and the smoke test with `npm run smoke`, both from the `StockSim` folder. The complete setup guide is in [StockSim/docs/SETUP.md](StockSim/docs/SETUP.md).

## Disclaimer

All stocks, companies and prices in this app are fictional and simulated. The app is for learning and demos only and is not connected to any real market.
