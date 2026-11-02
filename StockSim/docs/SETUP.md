# StockSim: complete setup guide

This guide takes a fresh Mac from nothing to a running StockSim app, passing tests, a passing smoke test, and a cloud simulator. Follow the sections in order. Each command shows what it should print, so you can tell when a step worked.

Contents

1. [What you need](#1-what-you-need)
2. [Get the code](#2-get-the-code)
3. [Install Xcode and the simulator](#3-install-xcode-and-the-simulator)
4. [Install JavaScript and iOS dependencies](#4-install-javascript-and-ios-dependencies)
5. [Run the app locally](#5-run-the-app-locally)
6. [Run the unit tests](#6-run-the-unit-tests)
7. [Run the smoke test locally](#7-run-the-smoke-test-locally)
8. [Run the app in the cloud (native-sim)](#8-run-the-app-in-the-cloud-native-sim)
9. [GitHub Actions (CI)](#9-github-actions-ci)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. What you need

| Tool | Version | Why |
| --- | --- | --- |
| macOS | 26 (Tahoe) or newer | iOS Simulator runs only on macOS |
| Xcode | 26.x or newer | Builds the iOS app and runs the simulator. Use the version that matches your macOS. |
| Command Line Tools | Installed with Xcode | Provides `git`, `clang` and other tools |
| Node.js | 22.11 or newer | JavaScript runtime. `nvm` is a good way to manage it. |
| npm | Comes with Node | Installs packages |
| CocoaPods | 1.16 or newer | Installs the iOS native libraries |
| GitHub CLI (`gh`) | Latest | Only for cloud runs and pushing to GitHub |
| agent-device | 0.20 or newer | Drives the simulator in the smoke test |
| native-sim | Latest | Runs the app in the cloud (optional) |

Check what you already have:

```bash
node -v
npm -v
xcodebuild -version
pod --version
gh --version
```

Install the missing pieces:

```bash
brew install cocoapods gh
npm install -g agent-device native-sim
```

If `brew` is not installed, install it from [brew.sh](https://brew.sh).

---

## 2. Get the code

```bash
git clone https://github.com/TANAYTAPANSHU/stocksim.git
cd stocksim
git checkout stock-trading-app
```

The repo layout:

```
stocksim/                 (repo root, npm workspace)
├── package.json          (workspace root: lists "StockSim")
├── package-lock.json     (single lockfile for the whole workspace)
├── .github/workflows/    (CI and iOS smoke test)
└── StockSim/             (the React Native app)
    ├── App.tsx
    ├── src/
    ├── e2e/smoke.ad      (smoke test script)
    ├── scripts/smoke.sh  (smoke test runner)
    ├── ios/              (Xcode workspace, Podfile)
    └── android/          (Android project)
```

Dependencies are installed from the repo root, because it is an npm workspace.

---

## 3. Install Xcode and the simulator

### 3.1 Install Xcode

1. Install **Xcode 26.x or newer** from the Mac App Store, or download a version from [developer.apple.com/download](https://developer.apple.com/download/all/) (Apple ID needed).
2. Open Xcode once. Accept the license and the "Install additional components" prompt.
3. Accept the license and finish the first-launch setup from the terminal:

```bash
sudo xcodebuild -license accept
sudo xcodebuild -runFirstLaunch
```

4. Select the Xcode you installed:

```bash
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
```

Check it:

```bash
xcodebuild -version
```

Expected output: `Xcode 26.x` (or newer) and a build number.

### 3.2 Install an iOS simulator runtime

Simulators need an iOS runtime.

1. Open **Xcode > Settings > Components**.
2. Find the **iOS** runtime that matches your Xcode version (for example iOS 26.x) and click **Get**.
3. Wait for the download. It is several GB.

List what is installed:

```bash
xcrun simctl runtime list
xcrun simctl list devices available | grep "iPhone 17 Pro"
```

Expected: an `iOS 26.x` runtime and at least one `iPhone 17 Pro` device. If no iPhone 17 Pro shows up, use any iPhone the runtime supports and change the device name in the commands below.

### 3.3 Check your macOS and Xcode match

If `xcodebuild` aborts with `Symbol not found: _XPCTypeBool`, your Xcode and macOS versions do not match. Install the Xcode version that matches your macOS (see [Troubleshooting](#10-troubleshooting)).

---

## 4. Install JavaScript and iOS dependencies

### 4.1 JavaScript packages (from the repo root)

```bash
cd stocksim
npm install
```

Expected: `added N packages` (no errors). Audit warnings are normal and can be ignored for this project.

### 4.2 iOS native pods

```bash
cd StockSim/ios
pod install
cd ../..
```

Expected: `Pod installation complete! There are N dependencies from the Podfile and M total pods installed.` (Last time: 89 dependencies and 88 pods.) The first run downloads the React Native artifacts and can take several minutes. The generated `StockSim.xcworkspace` is the file to open in Xcode.

Run this again after pulling changes that touch `ios/Podfile` or after adding a native package.

---

## 5. Run the app locally

Open two terminals.

**Terminal 1: start Metro (the JavaScript bundler):**

```bash
cd stocksim/StockSim
npm start
```

Expected: `Welcome to React Native` and `Dev server ready`. Keep this running.

If you see `EADDRINUSE: address already in use :::8081`, another Metro is running on port 8081. See [Troubleshooting](#10-troubleshooting).

**Terminal 2: build and run on the simulator:**

```bash
cd stocksim/StockSim
npm run ios
```

This boots a simulator, builds the app, installs it and launches it.

To pick a specific simulator:

```bash
npx react-native run-ios --simulator "iPhone 17 Pro"
```

You can also open `StockSim/ios/StockSim.xcworkspace` in Xcode and press **Run**. Metro must still be running.

Expected: the StockSim login screen. Type a username (3 to 20 letters, numbers or `_`) and press return.

---

## 6. Run the unit tests

```bash
cd stocksim/StockSim
npm test
```

Expected:

```
Tests:       16 passed, 16 total
```

Type check and lint:

```bash
npx tsc --noEmit
npx eslint src App.tsx __tests__
```

Both should finish with no output and exit code 0.

---

## 7. Run the smoke test locally

The smoke test starts the app, logs in, buys one share of `TCHN`, and checks the portfolio. It is written in `StockSim/e2e/smoke.ad` and driven by `agent-device`.

1. Make sure `agent-device` is installed (`agent-device --version` shows 0.20 or newer).
2. Boot a simulator and install the app. The easiest way is the steps in [section 5](#5-run-the-app-locally), with Metro running, or a Release build (no Metro needed):

```bash
cd stocksim/StockSim
xcodebuild -workspace ios/StockSim.xcworkspace -scheme StockSim \
  -configuration Release -sdk iphonesimulator \
  -destination 'platform=iOS Simulator,name=iPhone 17 Pro' \
  -derivedDataPath ios/build CODE_SIGNING_ALLOWED=NO build
xcrun simctl boot "iPhone 17 Pro" || true
xcrun simctl install booted ios/build/Build/Products/Release-iphonesimulator/StockSim.app
```

3. Run the smoke test:

```bash
npm run smoke
```

Expected:

```
✓ smoke.ad
Test summary: 1 passed (1)
```

The first run takes longer because `agent-device` builds its test runner. Reports go to `StockSim/e2e/reports/` (JUnit XML and screenshots), which is git-ignored.

If a step fails, the output shows the step, the selector that did not match, and suggested selectors from the live screen. Update the line in `e2e/smoke.ad` and run again.

---

## 8. Run the app in the cloud (native-sim)

This runs the app on a GitHub macOS runner and streams the simulator to your browser. It is useful when you have no Mac, or to share a live preview. Public repos use free macOS minutes. Private repos are billed.

### 8.1 Log in to GitHub

```bash
gh auth login
```

Choose GitHub.com, HTTPS and "Login with a web browser".

### 8.2 Check prerequisites

From the repo root:

```bash
native-sim doctor --framework react-native --project-dir StockSim
```

Expected: all lines show `✓`. The workflow file lines may show `!` the first time. `native-sim up` creates them.

### 8.3 Start a session

```bash
native-sim up --framework react-native --project-dir StockSim
```

Add `--agent` to also expose the agent-device proxy for the smoke test:

```bash
native-sim up --agent --framework react-native --project-dir StockSim
```

What happens:

1. The code is committed (if there are changes) and pushed to your repo.
2. A workflow run starts on a macOS runner. It installs JavaScript dependencies, boots a simulator, builds the app and installs it.
3. The CLI prints `Simulator is live` and a stream link. Anyone with that link can control the simulator, so do not share it.

Stop the session early with:

```bash
native-sim down
```

Otherwise it ends after about 30 minutes.

### 8.4 Run the smoke test against the cloud simulator

When started with `--agent`, the CLI prints an `agent-device connect proxy ...` command. Run that command, then:

```bash
cd StockSim
npm run smoke
```

The test runs on your Mac, but the simulator is in the cloud.

---

## 9. GitHub Actions (CI)

Two workflows live in `.github/workflows/`:

| Workflow | When it runs | Runner | What it does |
| --- | --- | --- | --- |
| `ci.yml` (CI) | Every push and pull request | Ubuntu (free, fast) | TypeScript check, lint, unit tests |
| `smoke-ios.yml` (iOS smoke test) | Pull requests and manual runs | macOS 26 | Release build, simulator boot, install, smoke test, upload reports |

Run the iOS smoke test on demand:

```bash
gh workflow run smoke-ios.yml --ref stock-trading-app
```

Check runs:

```bash
gh run list --workflow ci.yml --limit 3
gh run list --workflow smoke-ios.yml --limit 3
```

Download the smoke test reports from a finished run:

```bash
gh run download <run-id> --name smoke-test-reports
```

The CI workflow runs no simulator, so it is fast. The iOS smoke test is slower because macOS runners are slow and it builds the native app.

---

## 10. Troubleshooting

### `xcodebuild` aborts with `Symbol not found: _XPCTypeBool`
Your Xcode and macOS versions do not match. Install the Xcode version for your macOS (Xcode 26.x for macOS 26). Then run `sudo xcode-select -s` with the new path.

### `You have not agreed to the Xcode license agreements`
Run `sudo xcodebuild -license accept`, then `sudo xcodebuild -runFirstLaunch`.

### `pod` command fails with a Ruby or gem error
An old RVM Ruby can break the `pod` wrapper. Fix it with Homebrew CocoaPods:

```bash
brew install cocoapods
pod --version
```

If that does not help, run CocoaPods through its library directly from the `ios` folder:

```bash
ruby -rcocoapods -e 'Pod::Command.run(ARGV)' -- install
```

### `EADDRINUSE: address already in use :::8081`
Another Metro bundler is running on port 8081. Find it and stop it only if it is not yours:

```bash
lsof -i :8081
ps -o command= -p <PID>
kill <PID>
```

Then run `npm start` again.

### The simulator shows "Incompatible device" when creating an iPhone
The device type does not match the runtime. Use the device types that `xcrun simctl list devicetypes` lists for your runtime.

### Remove an old simulator runtime to free space
```bash
xcrun simctl runtime list
xcrun simctl runtime delete <identifier-or-disk-image-id>
xcrun simctl delete unavailable
```
Deleted runtimes are not in the Trash. Download them again from Xcode > Settings > Components if needed.

### The keyboard covers a button and the smoke test cannot tap it
The number pad has no return key. The Quantity field has a **Done** button that closes the keyboard. Use `keyboard enter` on the default keyboard to submit (the login screen logs in on return).

### Smoke test: `wait` timed out during runner startup
The first run builds the `agent-device` test runner. Give the first `wait` a long timeout (the smoke script uses 120 seconds).

### native-sim: `npm ci` fails with `ENOENT ... package.json` on the runner
The repo root must have the workspace `package.json` and the root lockfile. Make sure both are committed and pushed. Run `native-sim up` from the repo root with `--project-dir StockSim`.

### native-sim: `doctor` says the repo is public
That is the current setting. Public repos use free macOS minutes, but the source code and workflow logs are visible to everyone.

### `git push` works but nothing runs on GitHub
Only `ci.yml` runs on push. The iOS smoke test runs on pull requests and manual runs. Start it with `gh workflow run smoke-ios.yml --ref <branch>`.

---

## Quick reference

| Task | Command (run from the place shown) |
| --- | --- |
| Install packages | `npm install` (repo root) |
| Install pods | `pod install` (`StockSim/ios`) |
| Start Metro | `npm start` (`StockSim`) |
| Run on simulator | `npm run ios` (`StockSim`) |
| Unit tests | `npm test` (`StockSim`) |
| Smoke test | `npm run smoke` (`StockSim`) |
| Cloud session | `native-sim up --framework react-native --project-dir StockSim` (repo root) |
| Stop cloud session | `native-sim down` |
| Run iOS CI on demand | `gh workflow run smoke-ios.yml --ref stock-trading-app` |
