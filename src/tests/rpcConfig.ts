// src/rpcConfig.ts

export type RpcConfig = Record<number, string>

const rpcConfig: RpcConfig = {
  1: 'https://eth-mainnet.alchemyapi.io/v2/',
  137: 'https://polygon-mainnet.g.alchemy.com/v2/',
  10: 'https://optimism-mainnet.g.alchemy.com/v2/',
  8453: 'https://base-mainnet.g.alchemy.com/v2/',
  42161: 'https://arb-mainnet.g.alchemy.com/v2/',
}

export default rpcConfig
