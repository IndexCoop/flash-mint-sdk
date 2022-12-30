import 'dotenv/config'

import { JsonRpcProvider } from '@ethersproject/providers'
import { Wallet } from '@ethersproject/wallet'

import { ZeroExApi } from 'utils/0x'

// Alchemy
export const AlchemyProvider = new JsonRpcProvider(
  process.env.MAINNET_ALCHEMY_API,
  1
)

// Hardhat
export const LocalhostProvider = new JsonRpcProvider('http://127.0.0.1:8545/')

// Hardhat Account #0
export const SignerAccount0 = new Wallet(
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  LocalhostProvider
)

// ZeroExApi
const index0xApiBaseUrl = process.env.INDEX_0X_API
export const ZeroExApiSwapQuote = new ZeroExApi(
  index0xApiBaseUrl,
  '',
  { 'X-INDEXCOOP-API-KEY': process.env.INDEX_0X_API_KEY! },
  '/mainnet/swap/v1/quote'
)
