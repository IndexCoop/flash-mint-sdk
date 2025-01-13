/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChainId } from 'constants/chains'
import { IndexSwapQuoteProvider } from 'quote'
import {
  getLocalHostProviderUrl,
  getSignerAccount,
  getTestRpcProvider,
  getZeroExSwapQuoteProvider,
} from 'tests/utils'
import { TestFactory } from 'tests/utils/factory'

// Pre-configured TestFactories
export function getArbitrumTestFactory(
  signer: any,
  rpcUrl: string = getLocalHostProviderUrl(ChainId.Arbitrum),
) {
  const swapQuoteProvider = getZeroExSwapQuoteProvider(ChainId.Arbitrum)
  return new TestFactory(rpcUrl, signer, swapQuoteProvider)
}

export function getBaseTestFactory(
  signer: any,
  rpcUrl: string = getLocalHostProviderUrl(ChainId.Base),
) {
  const swapQuoteProvider = getZeroExSwapQuoteProvider(ChainId.Base)
  return new TestFactory(rpcUrl, signer, swapQuoteProvider)
}

export function getTestFactoryZeroEx(
  signerAccountNo: number,
  chainId = ChainId.Mainnet,
) {
  const provider = getTestRpcProvider(chainId)
  const signer = getSignerAccount(signerAccountNo, provider)
  const swapQuoteProvider = getZeroExSwapQuoteProvider(chainId)
  const rpcUrl = getLocalHostProviderUrl(chainId)
  return new TestFactory(rpcUrl, signer, swapQuoteProvider)
}

export function getMainnetTestFactoryUniswap(
  signer: any,
  rpcUrl: string = getLocalHostProviderUrl(ChainId.Mainnet),
) {
  const swapQuoteProvider = new IndexSwapQuoteProvider(rpcUrl)
  return new TestFactory(rpcUrl, signer, swapQuoteProvider)
}
