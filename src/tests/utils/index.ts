import 'dotenv/config'

import { BigNumber } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'
import { JsonRpcProvider } from '@ethersproject/providers'
import { Wallet } from '@ethersproject/wallet'

import { WETH } from 'constants/tokens'
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

// Hardhat Account #1
export const SignerAccount1 = new Wallet(
  '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
  LocalhostProvider
)

// Hardhat Account #2
export const SignerAccount2 = new Wallet(
  '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a',
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

// ERC20
export function createERC20Contract(
  address: string,
  providerOrSigner: JsonRpcProvider | Wallet
): Contract {
  const abi = [
    // Read-Only Functions
    'function allowance(address account, address spender) external view returns (uint)',
    'function balanceOf(address owner) view returns (uint256)',
    'function decimals() view returns (uint8)',
    'function symbol() view returns (string)',
    // Authenticated Functions
    'function approve(address spender, uint rawAmount) external returns (bool)',
    'function transfer(address to, uint amount) returns (bool)',
  ]
  return new Contract(address, abi, providerOrSigner)
}

// WETH
export async function wrapETH(amount: BigNumber, signer: Wallet) {
  const abi = ['function deposit() public payable']
  const WETH9 = WETH.address!
  const contract = new Contract(WETH9, abi, signer)
  const depositTokenInTx = await contract.deposit({
    gasLimit: 50_000,
    value: amount,
  })
  await depositTokenInTx.wait()
}
