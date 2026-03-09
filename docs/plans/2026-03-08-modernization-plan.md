# Frontend Modernization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Incrementally migrate Hourglass Finance from CRA/React 17/web3.js to Vite/React 19/wagmi+viem while keeping the app functional between each step.

**Architecture:** Six sequential phases — each phase produces a buildable, runnable app. Build toolchain first (Vite), then dead code removal, then React upgrade, then web3 stack swap, then UI consolidation, then deploy pipeline.

**Tech Stack:** Vite 6, React 19.2, wagmi 2.x, viem 2.x, @tanstack/react-query, react-router 7, react-bootstrap (latest), Hardhat 3 (contracts, separate workflow)

**Design doc:** `docs/plans/2026-03-08-modernization-design.md`
**Deferred items:** `later.md`
**DO NOT MODIFY:** `src/components/WarpBox/` (locked per CLAUDE.md)

---

## Phase 1: CRA → Vite

### Task 1: Install Vite and create config

**Files:**
- Create: `vite.config.js`
- Modify: `package.json`

**Step 1: Install Vite dependencies**

Run:
```bash
npm install --save-dev vite @vitejs/plugin-react vite-plugin-node-polyfills --legacy-peer-deps
```

**Step 2: Create Vite config**

Create `vite.config.js` in project root:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      include: ['buffer', 'process', 'stream', 'crypto', 'http', 'https', 'os', 'url', 'assert'],
      globals: {
        Buffer: true,
        process: true,
      },
    }),
  ],
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
  },
  css: {
    preprocessorOptions: {
      scss: {
        quietDeps: true,
      },
    },
  },
  define: {
    global: 'globalThis',
  },
})
```

**Step 3: Update package.json scripts**

Replace the `"scripts"` section in `package.json`:

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "test": "vitest"
}
```

**Step 4: Commit**

```bash
git add vite.config.js package.json package-lock.json
git commit -m "chore: add Vite config and update scripts"
```

---

### Task 2: Move index.html and update entry point

**Files:**
- Move: `public/index.html` → `index.html` (project root)
- Modify: `index.html`
- Modify: `src/index.js`

**Step 1: Move index.html to project root**

Run:
```bash
cp public/index.html index.html
```

**Step 2: Update index.html for Vite**

In root `index.html`:

1. Remove `%PUBLIC_URL%` from all asset paths (replace with `/`):
   - `%PUBLIC_URL%/favicon.ico` → `/favicon.ico`
   - `%PUBLIC_URL%/logo192.png` → `/logo192.png`
   - `%PUBLIC_URL%/manifest.json` → `/manifest.json`

2. Remove the jQuery CDN script tag (line 35) — jQuery is imported via npm, not CDN

3. Add module script before closing `</body>`:
```html
<script type="module" src="/src/index.js"></script>
```

**Step 3: Verify src/index.js entry point**

Check that `src/index.js` (lines 8-15) has the standard React render call. No changes needed yet — React 17's `ReactDOM.render()` still works at this stage.

**Step 4: Commit**

```bash
git add index.html
git commit -m "chore: move index.html to project root for Vite"
```

---

### Task 3: Rename environment variables

**Files:**
- Modify: `.env.development`
- Modify: `.env.production`
- Modify: `src/utils/getRpcUrl.js:4`
- Modify: `src/utils/web3React.js:14` (unused but rename for consistency before deletion in Phase 2)

**Step 1: Update .env.development**

Rename all `REACT_APP_` prefixes to `VITE_`:

```
VITE_CHAIN_ID = "97"
VITE_GTAG = "GTM-PXLD3XW"
VITE_NODE_1 = "https://data-seed-prebsc-1-s1.binance.org:8545/"
VITE_NODE_2 = "https://data-seed-prebsc-1-s1.binance.org:8545"
VITE_NODE_3 = "https://data-seed-prebsc-1-s1.binance.org:8545"
```

**Step 2: Update .env.production**

Same rename:

```
VITE_CHAIN_ID = "97"
VITE_GTAG = "GTM-TLF66T4"
VITE_NODE_1 = "https://bsc-dataseed1.ninicoin.io"
VITE_NODE_2 = "https://bsc-dataseed1.defibit.io"
VITE_NODE_3 = "https://bsc-dataseed.binance.org"
VITE_SUBGRAPH_PROFILE = "https://api.thegraph.com/subgraphs/name/pancakeswap/profile"
```

**Step 3: Update source references**

In `src/utils/getRpcUrl.js` (line 4), replace:
- `process.env.REACT_APP_NODE_1` → `import.meta.env.VITE_NODE_1`
- Same for NODE_2, NODE_3

In `src/utils/web3React.js` (line 14), replace:
- `process.env.REACT_APP_CHAIN_ID` → `import.meta.env.VITE_CHAIN_ID`

Search entire codebase for any remaining `process.env.REACT_APP_` and update:

Run:
```bash
grep -r "process.env.REACT_APP_" src/ --include="*.js" --include="*.jsx"
```

Fix any remaining references.

**Step 4: Commit**

```bash
git add .env.development .env.production src/utils/getRpcUrl.js src/utils/web3React.js
git commit -m "chore: rename REACT_APP_ env vars to VITE_ for Vite"
```

---

### Task 4: Handle jQuery global for ripple plugin

**Files:**
- Modify: `src/App.js:4,25-31`

**Step 1: Fix jQuery import for Vite**

In `src/App.js`, replace the jQuery import (line 4) with an explicit window assignment:

```javascript
import jQuery from 'jquery'
window.jQuery = window.$ = jQuery
```

The ripple plugin at lines 25-31 uses `window.jQuery` — this ensures it's available.

**Step 2: Commit**

```bash
git add src/App.js
git commit -m "chore: explicitly assign jQuery to window for Vite compatibility"
```

---

### Task 5: Remove react-scripts and verify Vite build

**Files:**
- Modify: `package.json` (remove react-scripts dependency)
- Delete: `public/index.html` (original, now at root)

**Step 1: Uninstall react-scripts**

Run:
```bash
npm uninstall react-scripts --legacy-peer-deps
```

**Step 2: Delete old index.html**

Run:
```bash
rm public/index.html
```

**Step 3: Start dev server**

Run:
```bash
npm run dev
```

Expected: Vite dev server starts on port 3000. App loads in browser. All 4 routes render (`/`, `/swap`, `/facuet`, `/reservoir`).

**Step 4: Test production build**

Run:
```bash
npm run build
npm run preview
```

Expected: Build completes. Preview server shows the app. Static files in `dist/`.

**Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove react-scripts, complete CRA to Vite migration"
```

---

## Phase 2: Purge Dead Dependencies

### Task 6: Remove unused npm packages

**Files:**
- Modify: `package.json`

**Step 1: Remove unused dependencies in batches**

Batch 1 — Never imported anywhere:
```bash
npm uninstall moralis faker fusioncharts react-fusioncharts chart.js react-chartjs-2 react-owl-carousel @truffle/hdwallet-provider styled-components npm install crypto-price cryptocurrency-unit-convert currency-converter-lt html2canvas react-water-wave web-vitals --legacy-peer-deps
```

Batch 2 — Dead web3 infrastructure (never mounted):
```bash
npm uninstall @web3-react/core @web3-react/injected-connector @web3-react/walletconnect-connector @binance-chain/bsc-connector @binance-chain/bsc-use-wallet --legacy-peer-deps
```

Batch 3 — Dead state management (Provider never mounted):
```bash
npm uninstall redux redux-thunk react-redux @reduxjs/toolkit --legacy-peer-deps
```

Batch 4 — Unused UI packages:
```bash
npm uninstall reactstrap @material-ui/icons @mui/icons-material big-integer web3-core-helpers --legacy-peer-deps
```

**Step 2: Verify build after each batch**

Run after each batch:
```bash
npm run dev
```

Expected: App still loads.

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: remove ~25 unused dependencies from fork lineage"
```

---

### Task 7: Remove unused source files

**Files:**
- Delete: `src/utils/web3React.js`
- Delete: `src/utils/wallet.js`
- Delete: `src/utils/contractHelpers.js`
- Delete: `src/hooks/useAuth.js`
- Delete: `src/hooks/useEagerConnect.js`
- Delete: `src/hooks/useApprove.js`
- Delete: `src/hooks/dataFetcher.js`
- Delete: `src/hooks/useWeb3.js`
- Delete: `src/hooks/useRefresh.js`
- Delete: `src/redux/` (entire directory)

**Step 1: Remove files**

Run:
```bash
rm src/utils/web3React.js src/utils/wallet.js src/utils/contractHelpers.js
rm src/hooks/useAuth.js src/hooks/useEagerConnect.js src/hooks/useApprove.js src/hooks/dataFetcher.js src/hooks/useWeb3.js src/hooks/useRefresh.js
rm -rf src/redux/
```

**Step 2: Search for broken imports**

Run:
```bash
grep -r "from.*useAuth\|from.*useEagerConnect\|from.*useApprove\|from.*dataFetcher\|from.*useWeb3\|from.*useRefresh\|from.*web3React\|from.*contractHelpers\|from.*wallet\|from.*redux" src/ --include="*.js" --include="*.jsx"
```

Expected: No results. If any file imports these, remove the import and the code that uses it (it was dead code).

**Step 3: Verify build**

Run:
```bash
npm run dev
```

Expected: App loads normally — none of these files were actually used by running components.

**Step 4: Commit**

```bash
git add -A
git commit -m "chore: remove unused source files (dead web3-react hooks, Redux store, unused utils)"
```

---

### Task 8: Verify clean build

**Step 1: Clean install**

Run:
```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

**Step 2: Build and run**

Run:
```bash
npm run build && npm run preview
```

Expected: Clean build, no warnings about missing modules, app runs.

**Step 3: Commit lock file**

```bash
git add package-lock.json
git commit -m "chore: clean lockfile after dependency purge"
```

---

## Phase 3: React 17 → 19

### Task 9: Upgrade React and fix createRoot

**Files:**
- Modify: `package.json`
- Modify: `src/index.js:1-15`

**Step 1: Upgrade React**

Run:
```bash
npm install react@latest react-dom@latest --legacy-peer-deps
```

**Step 2: Update src/index.js**

Replace `src/index.js` content (lines 1-15) — change from `ReactDOM.render()` to `createRoot()`:

```javascript
import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

Remove any `reportWebVitals()` call and its import (web-vitals was removed in Phase 2).

**Step 3: Verify**

Run:
```bash
npm run dev
```

Expected: App loads with React 19. Check browser console for deprecation warnings.

**Step 4: Commit**

```bash
git add package.json package-lock.json src/index.js
git commit -m "feat: upgrade React 17 to 19, use createRoot API"
```

---

### Task 10: Upgrade react-router to v7

**Files:**
- Modify: `package.json`
- Modify: `src/App.js:13`
- Modify: `src/components/Navbar/Navbar.jsx:3`
- Modify: `src/components/Main/Main.jsx:10`
- Modify: `src/components/Facuet/Facuet.jsx:14`

**Step 1: Swap packages**

Run:
```bash
npm uninstall react-router-dom --legacy-peer-deps
npm install react-router@latest --legacy-peer-deps
```

**Step 2: Update imports**

In every file that imports from `react-router-dom`, change the import source:

```javascript
// Before
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';

// After — standard imports
import { Routes, Route, Link, useNavigate } from 'react-router';

// After — DOM-specific imports (BrowserRouter)
import { BrowserRouter } from 'react-router/dom';
```

Files to update:
- `src/App.js:13` — has `BrowserRouter`, `Routes`, `Route` (split into two imports)
- `src/components/Navbar/Navbar.jsx:3` — has `Link`
- `src/components/Main/Main.jsx:10` — has `Link` or `useNavigate`
- `src/components/Facuet/Facuet.jsx:14` — has `Link` or `useNavigate`

**Step 3: Verify all routes**

Run:
```bash
npm run dev
```

Navigate to `/`, `/swap`, `/facuet`, `/reservoir`. All should render.

**Step 4: Commit**

```bash
git add package.json package-lock.json src/App.js src/components/Navbar/Navbar.jsx src/components/Main/Main.jsx src/components/Facuet/Facuet.jsx
git commit -m "feat: upgrade react-router-dom v6 to react-router v7"
```

---

### Task 11: Upgrade remaining React ecosystem deps

**Files:**
- Modify: `package.json`

**Step 1: Upgrade packages**

Run:
```bash
npm install react-bootstrap@latest react-toastify@latest react-icons@latest react-i18next@latest i18next@latest i18next-browser-languagedetector@latest i18next-http-backend@latest react-scroll@latest --legacy-peer-deps
```

**Step 2: Fix any breaking API changes**

Check for:
- `react-toastify` v11: CSS import may have changed. Verify `import 'react-toastify/dist/ReactToastify.css'` still works in `src/App.js`.
- `react-bootstrap` latest: Check that `Navbar`, `Nav`, `Button`, `Form`, `Table` components still work with same props.
- `react-i18next`: `useTranslation()` API is stable — should work without changes.

**Step 3: Verify**

Run:
```bash
npm run dev
```

Check all 4 routes render. Check toast notifications work (trigger a wallet connection without MetaMask).

**Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: upgrade react-bootstrap, react-toastify, i18next, react-icons to latest"
```

---

### Task 12: Fix any React 19 warnings

**Step 1: Check browser console**

Run `npm run dev` and open browser console. Look for:
- `useEffect` with async callback warnings
- Deprecated lifecycle warnings
- Any React 19 strict mode warnings

**Step 2: Fix issues**

Common fix — async useEffect (used in several components):
```javascript
// Before (triggers warning)
useEffect(async () => {
  const data = await fetchData();
  setState(data);
}, []);

// After
useEffect(() => {
  const fetchData = async () => {
    const data = await getData();
    setState(data);
  };
  fetchData();
}, []);
```

Check these files:
- `src/components/Main/Main.jsx`
- `src/components/Swap/Swap.jsx`
- `src/components/Facuet/Facuet.jsx`
- `src/components/Reservoir/Reservoir.jsx`

**Step 3: Verify clean console**

Run `npm run dev` — no React warnings in console.

**Step 4: Commit**

```bash
git add -A
git commit -m "fix: resolve React 19 useEffect async warnings"
```

---

## Phase 4: web3.js → wagmi + viem

### Task 13: Install wagmi/viem and create provider config

**Files:**
- Create: `src/config/wagmi.js`
- Modify: `src/App.js`
- Modify: `package.json`

**Step 1: Install packages**

Run:
```bash
npm install wagmi viem @tanstack/react-query --legacy-peer-deps
```

**Step 2: Create wagmi config**

Create `src/config/wagmi.js`:

```javascript
import { http, createConfig } from 'wagmi'
import { defineChain } from 'viem'

export const bscTestnet = defineChain({
  id: 97,
  name: 'BNB Smart Chain Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'tBNB',
    symbol: 'tBNB',
  },
  rpcUrls: {
    default: {
      http: [import.meta.env.VITE_NODE_1],
    },
  },
  blockExplorers: {
    default: { name: 'BscScan', url: 'https://testnet.bscscan.com' },
  },
  testnet: true,
})

export const config = createConfig({
  chains: [bscTestnet],
  transports: {
    [bscTestnet.id]: http(import.meta.env.VITE_NODE_1),
  },
})
```

**Step 3: Wrap App in providers**

In `src/App.js`, add providers around the existing `<BrowserRouter>`:

```javascript
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from './config/wagmi'

const queryClient = new QueryClient()

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          {/* existing routes */}
        </BrowserRouter>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
```

**Step 4: Verify app still works**

Run:
```bash
npm run dev
```

Expected: App loads normally. wagmi providers are mounted but nothing uses them yet. Existing web3.js code still works in parallel.

**Step 5: Commit**

```bash
git add src/config/wagmi.js src/App.js package.json package-lock.json
git commit -m "feat: add wagmi + viem providers alongside existing web3.js"
```

---

### Task 14: Replace wallet connection (loadWeb3 → wagmi)

**Files:**
- Modify: `src/components/Navbar/Navbar.jsx:21,37,46-50`
- Modify: `src/components/api.js` (will be deprecated, then deleted)

**Step 1: Rewrite Navbar wallet connection**

In `src/components/Navbar/Navbar.jsx`, replace the `loadWeb3` pattern with wagmi hooks:

```javascript
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { injected } from 'wagmi/connectors'

const Navbarapp = () => {
  const { address, isConnected } = useAccount()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()

  const strAcc = address
    ? address.substring(0, 6) + '...' + address.substring(address.length - 4)
    : ''

  const connectWallet = () => {
    connect({ connector: injected() })
  }

  // Remove the setInterval polling — wagmi handles account changes reactively
  // Remove the loadWeb3 import
```

**Step 2: Remove api.js loadWeb3 import from Navbar**

Remove `import { loadWeb3 } from '../api'` from Navbar.

**Step 3: Pass account to child routes**

The account address is now available via `useAccount()` in any component. Each page component will get its own `useAccount()` call (Phase 4, Tasks 15-18).

**Step 4: Verify wallet connection**

Run `npm run dev`. Click connect button. MetaMask should prompt. Address should display in navbar.

**Step 5: Commit**

```bash
git add src/components/Navbar/Navbar.jsx
git commit -m "feat: replace loadWeb3 wallet connection with wagmi useAccount/useConnect"
```

---

### Task 15: Replace contract calls in Main.jsx

**Files:**
- Modify: `src/components/Main/Main.jsx:14,16,30-66`

**Step 1: Replace web3 contract reads with wagmi**

Remove `import Web3 from "web3"` and the `webSupply` declaration (lines 14, 16).
Remove `import { loadWeb3 } from "../api"`.

Replace contract reads with wagmi/viem:

```javascript
import { useReadContract, useAccount, useBalance } from 'wagmi'
import { formatEther } from 'viem'
import { dripTokenAbi, dripTokenAddress } from '../utils/DripToken'

const Main = () => {
  const { address } = useAccount()

  const { data: totalTxs } = useReadContract({
    address: dripTokenAddress,
    abi: dripTokenAbi,
    functionName: 'totalTxs',
  })

  const { data: players } = useReadContract({
    address: dripTokenAddress,
    abi: dripTokenAbi,
    functionName: 'players',
  })

  const { data: totalSupply } = useReadContract({
    address: dripTokenAddress,
    abi: dripTokenAbi,
    functionName: 'totalSupply',
  })

  const formattedSupply = totalSupply
    ? parseFloat(formatEther(totalSupply)).toFixed(3)
    : '0'

  // Remove all setInterval polling — wagmi auto-refetches on block updates
  // Remove the axios call to the dead Heroku endpoint
```

**Step 2: Remove setInterval calls**

Remove the `setInterval(getData, 1000)` and `setInterval(getEventDetail, 10000)` patterns (lines 67-68). wagmi's `useReadContract` handles refetching automatically via its `query` options if needed:

```javascript
const { data: totalTxs } = useReadContract({
  address: dripTokenAddress,
  abi: dripTokenAbi,
  functionName: 'totalTxs',
  query: { refetchInterval: 10000 }, // optional: poll every 10s
})
```

**Step 3: Verify Main page renders**

Run `npm run dev`, navigate to `/`. Stats should display (or show 0/loading if ABI mismatch with deployed contracts — that's expected, see design doc).

**Step 4: Commit**

```bash
git add src/components/Main/Main.jsx
git commit -m "feat: replace web3.js contract reads with wagmi in Main page"
```

---

### Task 16: Replace contract calls in Swap.jsx

**Files:**
- Modify: `src/components/Swap/Swap.jsx:4,7,21-29`

**Step 1: Replace web3 imports and contract reads**

Same pattern as Task 15. Remove `Web3` import, `webSupply` declaration, `loadWeb3` import. Replace with wagmi hooks:

```javascript
import { useAccount, useReadContract, useWriteContract, useBalance } from 'wagmi'
import { formatEther, parseEther } from 'viem'
import { faucetTokenAbi, faucetTokenAddress } from '../utils/Faucet'
import { fountainContractAbi, fountainContractAddress } from '../utils/Fountain'
```

Replace `getData()` and `getDataWitoutMetamask()` with individual `useReadContract` hooks for each piece of data (balance, token balance, price).

Replace the Binance price API call (keep `axios` for this — it's an external REST API, not a contract call):
```javascript
import axios from 'axios'
// Keep: const usdValue = await axios.get("https://api.binance.com/api/v3/ticker/price?symbol=BNBUSDT")
```

**Step 2: Replace transaction sends**

For any buy/sell operations that use `.send()`, use wagmi's `useWriteContract`:

```javascript
const { writeContract } = useWriteContract()

const handleBuy = () => {
  writeContract({
    address: fountainContractAddress,
    abi: fountainContractAbi,
    functionName: 'bnbToTokenSwapInput',
    args: [1n], // min_tokens
    value: parseEther(amount),
  })
}
```

**Step 3: Replace web3.utils calls**

- `web3.utils.fromWei(value)` → `formatEther(value)`
- `web3.utils.toWei(value)` → `parseEther(value)`

**Step 4: Remove setInterval polling**

Same pattern as Task 15 — remove `setInterval`, use wagmi's built-in refetching.

**Step 5: Verify**

Run `npm run dev`, navigate to `/swap`. Page should render. Price chart should load (DevExpress charts are independent of web3).

**Step 6: Commit**

```bash
git add src/components/Swap/Swap.jsx
git commit -m "feat: replace web3.js with wagmi in Swap page"
```

---

### Task 17: Replace contract calls in Facuet.jsx

**Files:**
- Modify: `src/components/Facuet/Facuet.jsx:6,9-10,17,20`

**Step 1: Same migration pattern**

Remove Web3 imports, webSupply, loadWeb3. Replace with wagmi hooks.

Key contract interactions in Faucet:
- Reading: `balanceOf`, `claimsAvailable`, `userInfo`, `userInfoTotals`
- Writing: `deposit`, `claim`, `roll` (compound), `airdrop`

```javascript
import { useAccount, useReadContract, useWriteContract } from 'wagmi'
import { formatEther, parseEther } from 'viem'
import { faucetContractAbi, faucetContractAddress, faucetTokenAbi, faucetTokenAddress } from '../utils/Faucet'
import { buddySystemAbi, buddySystemAddress } from '../utils/BuddySystem'
```

**Step 2: Replace read calls**

Each `contract.methods.foo(args).call()` becomes a `useReadContract` hook.

**Step 3: Replace write calls**

Each `contract.methods.foo(args).send({ from: account })` becomes a `writeContract()` call.

**Step 4: Verify**

Run `npm run dev`, navigate to `/facuet`.

**Step 5: Commit**

```bash
git add src/components/Facuet/Facuet.jsx
git commit -m "feat: replace web3.js with wagmi in Faucet page"
```

---

### Task 18: Replace contract calls in Reservoir.jsx

**Files:**
- Modify: `src/components/Reservoir/Reservoir.jsx:13,16-23`

**Step 1: Same migration pattern**

Reservoir has the most complex contract interactions:
- Reading: `dividendsOf`, `calculateLiquidityToBnb`, `statsOf` (returns uint256[15] array), `lockedTokenBalance`, `players`, `totalSupply`, `balanceOf`
- Writing: `buy` (payable), `sell`, `withdraw`, `reinvest`

```javascript
import { useAccount, useReadContract, useWriteContract, useBalance } from 'wagmi'
import { formatEther, parseEther } from 'viem'
import { reservoirAbi, reservoirAddress } from '../utils/Reservoir'
import { fountainContractAbi, fountainContractAddress } from '../utils/Fountain'
```

**Step 2: Handle statsOf return**

`statsOf` returns `uint256[15]`. In wagmi:

```javascript
const { data: stats } = useReadContract({
  address: reservoirAddress,
  abi: reservoirAbi,
  functionName: 'statsOf',
  args: [address],
  query: { enabled: !!address },
})
// stats is a tuple/array — access as stats[0], stats[14], etc.
```

**Step 3: Handle payable buy**

```javascript
const { writeContract } = useWriteContract()

const handleBuy = () => {
  writeContract({
    address: reservoirAddress,
    abi: reservoirAbi,
    functionName: 'buy',
    value: parseEther(amount),
  })
}
```

**Step 4: Verify**

Run `npm run dev`, navigate to `/reservoir`.

**Step 5: Commit**

```bash
git add src/components/Reservoir/Reservoir.jsx
git commit -m "feat: replace web3.js with wagmi in Reservoir page"
```

---

### Task 19: Remove old web3 packages and Node polyfills

**Files:**
- Modify: `package.json`
- Modify: `vite.config.js`
- Delete: `src/components/api.js`
- Delete: `src/utils/web3.js`

**Step 1: Delete old web3 files**

```bash
rm src/components/api.js src/utils/web3.js
```

**Step 2: Search for remaining web3 imports**

```bash
grep -r "from.*web3\|import.*Web3\|window.web3\|window.ethereum" src/ --include="*.js" --include="*.jsx"
```

Expected: No results. If any remain, fix them.

**Step 3: Uninstall old packages**

```bash
npm uninstall web3 @web3-react/core @web3-react/injected-connector @web3-react/walletconnect-connector bignumber.js --legacy-peer-deps
```

(Some of these may already be gone from Phase 2. npm uninstall is idempotent.)

**Step 4: Remove Node polyfills from Vite config**

In `vite.config.js`, remove the `vite-plugin-node-polyfills` import and plugin entry. viem is browser-native and needs no polyfills.

```bash
npm uninstall vite-plugin-node-polyfills --save-dev --legacy-peer-deps
```

Update `vite.config.js`:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
  },
  css: {
    preprocessorOptions: {
      scss: {
        quietDeps: true,
      },
    },
  },
})
```

Remove the `define: { global: 'globalThis' }` — only needed for web3.js.

**Step 5: Clean build**

```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
npm run build
npm run dev
```

Expected: Clean build, no polyfill warnings, app runs.

**Step 6: Commit**

```bash
git add -A
git commit -m "feat: remove web3.js, node polyfills — migration to wagmi+viem complete"
```

---

## Phase 5: UI Library Consolidation

### Task 20: Replace MUI v4 usage in Chart.js

**Files:**
- Modify: `src/components/Swap/Chart.js` (or wherever DevExpress chart lives)

**Step 1: Identify MUI v4 usage**

The chart component uses `Paper` and `withStyles` from `@material-ui/core`. Replace with plain HTML/CSS or react-bootstrap `Card`:

```javascript
// Before
import { Paper } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'

// After
import { Card } from 'react-bootstrap'
// Replace <Paper> with <Card> or <div> with className
// Replace withStyles HOC with inline styles or CSS class
```

**Step 2: Verify chart renders**

Run `npm run dev`, navigate to `/swap`, check chart renders.

**Step 3: Commit**

```bash
git add src/components/Swap/Chart.js
git commit -m "refactor: replace MUI v4 Paper/withStyles with react-bootstrap in Chart"
```

---

### Task 21: Replace MUI v5 usage in Swap.jsx

**Files:**
- Modify: `src/components/Swap/Swap.jsx`

**Step 1: Replace Popover and Typography**

```javascript
// Before
import { Popover, Typography } from '@mui/material'

// After — use react-bootstrap OverlayTrigger + Popover
import { OverlayTrigger, Popover } from 'react-bootstrap'
```

Adapt the Popover usage to react-bootstrap's API.

**Step 2: Verify**

Run `npm run dev`, check Swap page popover behavior.

**Step 3: Commit**

```bash
git add src/components/Swap/Swap.jsx
git commit -m "refactor: replace MUI v5 Popover with react-bootstrap in Swap"
```

---

### Task 22: Remove MUI packages

**Files:**
- Modify: `package.json`

**Step 1: Uninstall all MUI/emotion packages**

```bash
npm uninstall @material-ui/core @mui/material @mui/styled-engine-sc @emotion/react @emotion/styled --legacy-peer-deps
```

**Step 2: Search for remaining MUI imports**

```bash
grep -r "@material-ui\|@mui\|@emotion" src/ --include="*.js" --include="*.jsx"
```

Expected: No results.

**Step 3: Verify build**

```bash
npm run build && npm run dev
```

**Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: remove all MUI and Emotion packages — consolidated on react-bootstrap"
```

---

## Phase 6: Deploy Pipeline

### Task 23: Configure Vercel deployment

**Files:**
- Create: `vercel.json`

**Step 1: Create Vercel config**

Create `vercel.json` in project root:

```json
{
  "buildCommand": "vite build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

The `rewrites` rule handles client-side routing — all paths serve `index.html` so react-router can handle them.

**Step 2: Deploy**

Connect repo to Vercel via dashboard or CLI:

```bash
npx vercel --prod
```

**Step 3: Verify**

Navigate to the Vercel URL. All 4 routes should work, including direct navigation (not just from `/`).

**Step 4: Commit**

```bash
git add vercel.json
git commit -m "chore: add Vercel deployment config"
```

---

### Task 24: Configure IPFS deployment

**Files:**
- Modify: `package.json` (add deploy script)

**Step 1: Install IPFS deploy tool**

```bash
npm install --save-dev ipfs-deploy --legacy-peer-deps
```

**Step 2: Add deploy script**

Add to `package.json` scripts:

```json
"deploy:ipfs": "vite build && ipd -p pinata dist"
```

(Requires `IPFS_DEPLOY_PINATA__API_KEY` and `IPFS_DEPLOY_PINATA__SECRET_API_KEY` env vars, or use a different pinning service.)

**Step 3: Test deployment**

```bash
npm run deploy:ipfs
```

Expected: Build completes, files pinned to IPFS, CID returned.

**Step 4: Verify**

Open `https://ipfs.io/ipfs/<CID>` — app should load.

**Step 5: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add IPFS deployment via Pinata"
```

---

## Final Verification

After all 24 tasks, run through the success criteria:

1. `npm run dev` starts on Vite — no `--openssl-legacy-provider` ✓
2. All 4 routes render ✓
3. Wallet connects via wagmi ✓
4. Contract reads work (with matching ABIs) ✓
5. Contract writes work (with matching ABIs) ✓
6. WarpBox renders identically ✓
7. `npm run build` produces `dist/` ✓
8. Vercel deploys from git push ✓
9. IPFS pin works ✓
10. Zero unused fork dependencies in `package.json` ✓
