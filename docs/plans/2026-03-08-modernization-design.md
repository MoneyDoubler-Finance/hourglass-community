# Hourglass Finance — Frontend Modernization Design

**Date:** 2026-03-08
**Strategy:** Incremental (build-first ordering)
**Sequence:** Vite → Purge → React 19 → wagmi/viem → UI consolidation → Deploy pipeline

## Migration Phases

### Phase 1 — CRA → Vite

- Remove `react-scripts`, add `vite` + `@vitejs/plugin-react`
- Move `public/index.html` → `index.html` (project root), add `<script type="module" src="/src/index.js">`
- Create `vite.config.js` with React plugin, SASS support, and `vite-plugin-node-polyfills` (web3.js v1 needs `Buffer`, `process`, etc. — removed in Phase 4)
- Rename all `process.env.REACT_APP_*` → `import.meta.env.VITE_*` across the codebase
- Update `.env.development` / `.env.production` variable prefixes
- Remove `--openssl-legacy-provider` hack from scripts
- jQuery: explicit `window.jQuery = window.$ = jQuery` assignment for the ripple plugin, or Vite `define` config

### Phase 2 — Purge dead dependencies

Remove ~20 unused packages:

- `moralis`, `faker`, `fusioncharts`, `react-fusioncharts`, `chart.js`, `react-chartjs-2`
- `react-owl-carousel`, `@truffle/hdwallet-provider`, `styled-components`, `reactstrap`
- `@material-ui/icons`, `@mui/icons-material`
- `redux`, `redux-thunk`, `react-redux`, `@reduxjs/toolkit`
- `npm`, `install`, `big-integer`, `crypto-price`, `cryptocurrency-unit-convert`, `currency-converter-lt`
- `web3-core-helpers`, `web-vitals`, `html2canvas`, `react-water-wave`

Remove unused source files:

- `src/utils/web3React.js`, `src/hooks/useAuth.js`, `src/hooks/useEagerConnect.js`
- `src/hooks/useApprove.js`, `src/hooks/dataFetcher.js`, `src/utils/contractHelpers.js`, `src/utils/wallet.js`
- `src/redux/` (store never wrapped in Provider — completely inert)
- `RefreshContext` (defined but never mounted)

Verify app still builds and runs after each removal batch.

### Phase 3 — React 17 → 19

- Update `react` and `react-dom` to 19.2+
- Change `ReactDOM.render()` → `createRoot().render()` in `src/index.js`
- Update `react-bootstrap` to latest (React 19 compatible)
- Update `react-router-dom` → `react-router` v7 (rename imports)
- Update `react-toastify`, `react-icons`, `react-i18next`, `i18next` to latest
- Fix any `useEffect` async warnings

### Phase 4 — web3.js → wagmi + viem

- Install `wagmi`, `viem`, `@tanstack/react-query`
- Create wagmi config with BNB Chain testnet (chain ID 97)
- Wrap app in `WagmiProvider` + `QueryClientProvider`
- Replace `loadWeb3()` / `window.web3` pattern with `useAccount()`, `useConnect()`
- Replace all `new web3.eth.Contract()` + `.methods.foo().call()` with `useReadContract()` / `readContract()`
- Replace `.methods.foo().send()` with `useWriteContract()` / `writeContract()`
- Replace `web3.utils.fromWei()` with viem's `formatEther()`
- Replace `web3.eth.getBalance()` with `useBalance()` or `getBalance()`
- Remove `web3`, `@web3-react/*`, `@binance-chain/*`, `bignumber.js` packages
- Remove `vite-plugin-node-polyfills` (viem is browser-native)
- Update ABI files in `src/components/utils/` to match actual contract ABIs from Hardhat compilation

### Phase 5 — UI library consolidation

- Audit actual usage: `react-bootstrap` (Navbar, Button, Form, Table), `@material-ui/core` (Paper + withStyles in Chart.js), `@mui/material` (Popover + Typography in Swap.jsx)
- Migrate the 2 MUI v4 usages and 2 MUI v5 usages to `react-bootstrap` equivalents
- Remove `@material-ui/core`, `@mui/material`, `@mui/styled-engine-sc`, `@emotion/react`, `@emotion/styled`
- Remove duplicate charting (keep DevExpress or replace with lighter alternative)

### Phase 6 — Deploy pipeline

- Vercel: connect git repo, set build command to `vite build`, output to `dist/`
- IPFS: add `ipfs-deploy` or Fleek integration, pin `dist/` folder after build
- Publish IPFS CID somewhere discoverable (ENS name, on-chain, or README)

## What stays untouched

- **WarpBox component** — `src/components/WarpBox/` is locked. No changes under any circumstances.
- **Smart contract ABI format** — viem uses identical ABI JSON. Content updated separately via Hardhat.
- **i18n translation keys** — Old names (`"SOL/Splash"`, `"HYDRATE"`) remain; only values are user-facing.
- **jQuery ripple effect** — Stays. Vite handles the global import.
- **Route paths** — `/`, `/swap`, `/facuet`, `/reservoir` unchanged (including the `facuet` typo).
- **Component structure** — Same pages, same directory layout. Internals swap, not organization.

## Risk areas and mitigations

**Node polyfills (Phase 1):** web3.js v1 depends on Node built-ins (`Buffer`, `process`, `stream`, `crypto`). CRA's Webpack 4 polyfilled these automatically. Vite doesn't. Use `vite-plugin-node-polyfills` during Phase 1-3. Removed in Phase 4 when viem replaces web3.js.

**jQuery + Vite (Phase 1):** The ripple plugin expects `window.jQuery` globally. Vite tree-shakes by default. Mitigation: explicit `window.jQuery = window.$ = jQuery` in the import.

**react-bootstrap version gap (Phase 3):** Current 2.0.3 may not support React 19. Jump to latest — API is mostly stable but some prop names may have changed.

**ABI mismatch (Phase 4):** Current ABIs in `src/components/utils/` are from the Splassive fork. Functions like `calculateBNBReward()` and `mintDJT()` don't exist in the actual contracts. Until Hardhat deployment generates fresh ABIs, the dApp can't call contracts successfully. This is a data problem, not a library problem.

**DevExpress charts + React 19 (Phase 3/5):** `@devexpress/dx-react-chart` 2.7.6 may not be compatible with React 19. If it breaks, pin with compatibility wrapper or replace during Phase 5.

## Success criteria

1. `npm run dev` starts the app on Vite with no `--openssl-legacy-provider` hack
2. All 4 routes (`/`, `/swap`, `/facuet`, `/reservoir`) render correctly
3. Wallet connects via wagmi (MetaMask / injected provider)
4. Contract read calls work (balances, supply, player counts)
5. Contract write calls work (swap, claim, deposit)
6. WarpBox glassmorphism renders identically to current state
7. App builds to static `dist/` folder with `vite build`
8. Deploys to Vercel from git push
9. `dist/` pins to IPFS and loads from an IPFS gateway
10. Zero unused dependencies from the old fork remain in `package.json`

Note: criteria 3-5 depend on having deployed contracts with matching ABIs. Until Hardhat deployment happens, those are tested against existing testnet contracts (which may have ABI mismatches from the fork — known pre-existing issue, not a regression).
