## Outdated Technology Audit — Hourglass Finance

### CRITICAL — Replace Immediately

| Package | Your Version | Current | Status |
|---|---|---|---|
| **`web3`** | 1.6.1 | 4.16 (but **sunset March 2025**, repo archived) | ChainSafe walked away. Migrate to **viem** or **ethers.js v6** |
| **`faker`** | 5.5.3 | N/A — **sabotaged** by its author in Jan 2022 | Security risk. Replace with `@faker-js/faker` (v10+) |
| **`react-scripts` (CRA)** | 4.0.3 | 5.0.1 (but **officially deprecated** Feb 2025 by React team) | No active maintainers. Migrate to **Vite** |

### HIGH — Outdated/Abandoned, Blocking Modernization

| Package | Your Version | Current | Status |
|---|---|---|---|
| **`react`** | 17.0.2 | 19.2+ | 2 major versions behind. Missing hooks improvements, concurrent features, Server Components, Actions, React Compiler |
| **`@binance-chain/bsc-connector`** | 1.0.0 | — | **Abandoned** ~5 years ago. Binance rebranded to BNB Chain, rebuilt connectors around wagmi v2 |
| **`@binance-chain/bsc-use-wallet`** | 0.8.1 | — | **Abandoned** (~45 downloads/week) |
| **`@web3-react/core`** | 6.1.9 | 8.2.3 (stale) | Ecosystem moved to **wagmi + viem**. v6 connectors never ported |
| **`@web3-react/injected-connector`** | 6.0.7 | — | **Never updated.** Removed in web3-react v8 |
| **`@truffle/hdwallet-provider`** | 1.4.1 | 2.1.15 (archived) | Truffle Suite **officially sunset** Sept 2023, repo archived Feb 2024. Migrate to **Hardhat** or **Foundry** |
| **`moralis`** | 0.0.54 | 2.27.2 | 3 major versions behind. v0 API is completely gone |
| **`axios`** | 0.21.4 | 1.13.6 | **Known CVEs** in v0.x. Breaking changes in v1 |
| **`@material-ui/core`** | 4.12.3 | — | **Deprecated.** Entire `@material-ui/*` scope abandoned since 2021. Now `@mui/material` v7 |
| **`@material-ui/icons`** | 4.11.2 | — | Same — replaced by `@mui/icons-material` |

### MEDIUM — Outdated but Functional

| Package | Your Version | Current | Status |
|---|---|---|---|
| **`@mui/material`** | 5.2.6 | 7.3.9 | 2 major versions behind (v6 changed CSS engine, v7 added React 19 support) |
| **`@mui/icons-material`** | 5.2.5 | 7.x | Same as above |
| **`react-router-dom`** | 6.2.1 | 7.10+ (package renamed to `react-router`) | v7 requires React 18+ and Node 20+ |
| **`@reduxjs/toolkit`** | 1.6.0 | 2.11.0 | v2 dropped legacy middleware format, added RTK Query improvements |
| **`react-redux`** | 7.2.4 | 9.x | v8 dropped legacy context, v9 requires React 18+ |
| **`redux`** / **`redux-thunk`** | 4.1 / 2.3 | Bundled in RTK 2.x | Separate installs no longer needed with modern RTK |
| **`react-owl-carousel`** | 2.3.3 | — | **Abandoned** ~5 years. Replace with Embla Carousel or Swiper |
| **`reactstrap`** | 8.10.0 | 9.2.3 | v8 is Bootstrap 4; v9 is Bootstrap 5 |
| **`styled-components`** | 5.3.3 | 6.3.11 | v5 in legacy mode. v6 rewritten in TS |
| **`bootstrap`** | 5.1.3 | 5.3+ | Minor but includes new utilities, color modes |

### LOW — Worth Noting

| Package | Your Version | Issue |
|---|---|---|
| **`jquery`** | 3.6.0 | Antipattern in React (direct DOM manipulation conflicts with virtual DOM). Current is 4.0 |
| **`react-bootstrap`** | 2.0.3 | Current is 2.10+. Also: you have **both** `reactstrap` and `react-bootstrap` — they do the same thing |
| **`i18next`** | 21.6.3 | Current is 25.x |
| **`react-i18next`** | 11.15.1 | Current is 15.x |
| **`chart.js`** | 3.7.0 | Current is 4.x (tree-shakeable rewrite) |
| **`react-chartjs-2`** | 4.0.0 | Current is 5.x |
| **`sass`** | 1.32.8 | Current is 1.85+. Dart Sass dropped `@import` in favor of `@use` |
| **`react-toastify`** | 8.1.0 | Current is 11.x |
| **`react-icons`** | 4.3.1 | Current is 5.x |
| **`html2canvas`** | 1.4.1 | Current is 1.4.1 (unchanged, but html-to-image is the modern alternative) |
| **`web-vitals`** | 1.0.1 | Current is 4.x |
| **`fusioncharts`** | 3.18.0 | Current is 4.x+ |
| **`npm`** / **`install`** | 8.3 / 0.13 | These are **junk dependencies** — npm packages called `npm` and `install` that do nothing useful. Remove them |

### Architectural / Pattern Issues

1. **`window.ethereum.enable()`** in `api.js:67` — Deprecated since 2020. Use `window.ethereum.request({ method: 'eth_requestAccounts' })` instead
2. **Hardcoded chain ID `43113`** (Avalanche Fuji) in `api.js:71` — Doesn't match your BSC testnet env config (`97`)
3. **`window.web3` global** — Storing Web3 on `window` is a legacy pattern from 2018-era dApps. Modern approach: React context or wagmi hooks
4. **Callback-style `getChainId`** (`api.js:68`) — web3 v1 callbacks are removed in v4. Should use async/await
5. **Duplicate UI libraries** — You're importing from `@material-ui/core` (v4), `@mui/material` (v5), `react-bootstrap`, `reactstrap`, AND `bootstrap` simultaneously. That's 4 overlapping component libraries
6. **DevExpress charts** (`@devexpress/dx-react-chart`) + FusionCharts + Chart.js — 3 separate charting libraries
7. **Two BigNumber libraries** — `big-integer` and `bignumber.js` (most web3 code now uses native `BigInt` or viem's built-in handling)
8. **`NODE_OPTIONS=--openssl-legacy-provider`** — Required because CRA 4 uses a Webpack version incompatible with Node 18+ OpenSSL. Node 24 LTS (current) may drop this flag entirely. Goes away when you migrate off CRA

### Summary

The entire **Web3 stack** is the most urgent problem — `web3.js`, `@web3-react`, and the Binance connectors are all dead/sunset. The modern replacement is **wagmi + viem**, which would also eliminate the need for separate BigNumber libraries, the `window.web3` pattern, and the manual chain-switching code.

The **build toolchain** (CRA → Vite) is the second priority since it's blocking you from upgrading to React 18/19 without pain, and forces the `--openssl-legacy-provider` hack.

Everything else can be addressed incrementally after those two foundations are modernized.
