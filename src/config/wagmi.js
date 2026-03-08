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
