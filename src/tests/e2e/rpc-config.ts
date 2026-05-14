export type RpcConfig = Record<number, string>

const rpcConfig: RpcConfig = {
  // Legacy `eth-mainnet.alchemyapi.io` returns HTTP 410 Gone. Modern Alchemy
  // domain (matches the other chains here).
  1: 'https://eth-mainnet.g.alchemy.com/v2/',
  10: 'https://optimism-mainnet.g.alchemy.com/v2/',
  8453: 'https://base-mainnet.g.alchemy.com/v2/',
  42161: 'https://arb-mainnet.g.alchemy.com/v2/',
}

export default rpcConfig
