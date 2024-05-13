/* eslint-disable @typescript-eslint/no-non-null-assertion */
import 'dotenv/config'

import { BigNumber } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'
import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers'
import { Wallet } from '@ethersproject/wallet'

import { WETH } from 'constants/tokens'
import { ZeroExApi } from 'utils/0x'

export { wei } from 'utils/numbers'
export * from './factories'
export { QuoteTokens } from './quoteTokens'
export * from './lido'
export * from './uniswap'

// Alchemy
export const AlchemyProvider = new JsonRpcProvider(
  process.env.MAINNET_ALCHEMY_API,
  1
)

// Hardhat
export const LocalhostProvider = new JsonRpcProvider('http://127.0.0.1:8545/')
export const LocalhostProviderArbitrum = new JsonRpcProvider(
  'http://127.0.0.1:8548/'
)

export function getSignerAccount(num: number = 0, provider: JsonRpcProvider) {
  let privateKey =
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
  switch (num) {
    case 1:
      privateKey =
        '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d'
      break
    case 2:
      privateKey =
        '0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6'
      break
  }
  return new Wallet(privateKey, provider)
}

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

// Hardhat Account #3
export const SignerAccount3 = new Wallet(
  '0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6',
  LocalhostProvider
)

// Hardhat Account #4
export const SignerAccount4 = new Wallet(
  '0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a',
  LocalhostProvider
)

// Hardhat Account #5
export const SignerAccount5 = new Wallet(
  '0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba',
  LocalhostProvider
)

// Hardhat Account #17
export const SignerAccount17 = new Wallet(
  '0x689af8efa8c651a91ad287602527f3af2fe9f6501a7ac4b061667b5a93e037fd',
  LocalhostProvider
)

export async function resetHardhat(
  provider: JsonRpcProvider,
  blockNumber: number
) {
  await provider.send('hardhat_reset', [
    {
      forking: {
        jsonRpcUrl: process.env.MAINNET_ALCHEMY_API!,
        blockNumber,
      },
    },
  ])
}

// ZeroExApi
const index0xApiBaseUrl = process.env.INDEX_0X_API
export const ZeroExApiSwapQuote = new ZeroExApi(
  index0xApiBaseUrl,
  '',
  { 'X-INDEXCOOP-API-KEY': process.env.INDEX_0X_API_KEY! },
  '/mainnet/swap/v1/quote'
)

export const ZeroExApiArbitrumSwapQuote = new ZeroExApi(
  index0xApiBaseUrl,
  '',
  { 'X-INDEXCOOP-API-KEY': process.env.INDEX_0X_API_KEY! },
  '/arbitrum/swap/v1/quote'
)

// Balance

export async function transferFromWhale(
  whale: string,
  to: string,
  amount: BigNumber,
  erc20Address: string,
  provider: JsonRpcProvider
) {
  const signer = await provider.getSigner(whale)
  const contract = createERC20Contract(erc20Address, signer)
  const balance = await contract.balanceOf(whale)
  if (balance.lt(amount)) {
    throw new Error(
      `Not enough balance to steal ${amount} ${erc20Address} from ${whale}: ${balance}`
    )
  }
  await provider.send('hardhat_impersonateAccount', [whale])
  const transferTx = await contract.transfer(to, amount, {
    gasLimit: 100_000,
  })
  await transferTx.wait()
  await provider.send('hardhat_stopImpersonatingAccount', [whale])
}

// ERC20
export function createERC20Contract(
  erc20Address: string,
  providerOrSigner: JsonRpcProvider | JsonRpcSigner | Wallet
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
  return new Contract(erc20Address, abi, providerOrSigner)
}

export async function approveErc20(
  erc20Address: string,
  spender: string,
  amount: BigNumber,
  signer: Wallet
) {
  const contract = createERC20Contract(erc20Address, signer)
  const approveTx = await contract.approve(spender, amount, {
    gasLimit: 100_000,
  })
  await approveTx.wait()
}

export async function allowanceOf(
  erc20Address: string,
  spender: string,
  signer: Wallet
): Promise<BigNumber> {
  const contract = createERC20Contract(erc20Address, signer)
  return await contract.allowance(signer.address, spender)
}

export async function balanceOf(
  signer: Wallet,
  erc20Address: string
): Promise<BigNumber> {
  const contract = createERC20Contract(erc20Address, signer)
  return await contract.balanceOf(signer.address)
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
