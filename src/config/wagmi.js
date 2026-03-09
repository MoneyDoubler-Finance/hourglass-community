import { http, createConfig } from 'wagmi'
import { defineChain, fallback } from 'viem'

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
      http: [
        import.meta.env.VITE_NODE_1,
        import.meta.env.VITE_NODE_2,
        import.meta.env.VITE_NODE_3,
      ],
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
    [bscTestnet.id]: fallback([
      http(import.meta.env.VITE_NODE_1),
      http(import.meta.env.VITE_NODE_2),
      http(import.meta.env.VITE_NODE_3),
    ]),
  },
})
