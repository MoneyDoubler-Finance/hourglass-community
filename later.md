# Deferred Work — Not Part of Modernization Migration

Items explicitly left for later. These are known issues, not forgotten ones.

## Smart Contracts

- **Recompile contracts with Hardhat 3** and generate fresh ABIs to replace the Splassive-era ABIs in `src/components/utils/`
- **Deploy contracts in order** (DripToken → TokenMint → Vault → BuddySystem → Fountain → Faucet → Reservoir) with post-deployment wiring (whitelist, vault address, unpause)
- **Reconcile function names** — frontend calls functions that don't exist in the actual contracts (`calculateBNBReward()`, `mintDJT()`) — these are Splassive leftovers

## i18n

- **Translation keys still use old names** (`"SOL/Splash"`, `"HYDRATE"`, `"TheWell"`) — only values are user-facing and those are updated, but the keys should be renamed for maintainability

## UI Cleanup

- **jQuery ripple effect** in `App.js` — works but is an antipattern in React. Could be replaced with a pure CSS/React hook implementation
- **Route path typo** — `/facuet` should be `/faucet`. Changing URLs requires redirect handling
- **Footer social links** are dummy placeholders pending real Hourglass accounts
- **DevExpress charts** — if they break on React 19, replace with a lighter charting library (Recharts, Lightweight Charts)

## Solidity

- **Contracts use Solidity ^0.4.25** (6 of 7 contracts) — functional but missing modern safety features (built-in overflow checks in 0.8+, custom errors, etc.). Not urgent since they compile and deploy fine, but worth considering for future contract iterations
- **Chain ID mismatches** in the codebase — `api.js` checks for 43113 (Avalanche Fuji), `wallet.js` hardcodes 56 (BSC Mainnet), env files say 97 (BSC Testnet). Gets resolved naturally during the wagmi migration (Phase 4) since chain config is centralized

## Infrastructure

- **Dead external endpoints** — `https://api.sol-test.network` (Avalanche RPC hardcoded in components) and `https://splash-test-app.herokuapp.com` (Heroku free tier died Nov 2022) need to be replaced or removed
- **PancakeSwap subgraph URL** in `.env.production` — probably not used but should be verified and removed if dead
