import { ChainId } from 'constants/chains'
import { IndexSwapQuoteProvider } from 'quote'
import {
  getLocalHostProviderUrl,
  getSignerAccount,
  getTestRpcProvider,
  getZeroExSwapQuoteProvider,
  getZeroExV2SwapQuoteProvider,
} from 'tests/utils'
import { TestFactory } from 'tests/utils/factory'

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

export function getTestFactoryZeroExV2(
  signerAccountNo: number,
  chainId = ChainId.Mainnet,
) {
  const provider = getTestRpcProvider(chainId)
  const signer = getSignerAccount(signerAccountNo, provider)
  const swapQuoteProvider = getZeroExSwapQuoteProvider(chainId)
  const swapQuoteProviderV2 = getZeroExV2SwapQuoteProvider()
  const rpcUrl = getLocalHostProviderUrl(chainId)
  return new TestFactory(rpcUrl, signer, swapQuoteProvider, swapQuoteProviderV2)
}

export function getMainnetTestFactoryUniswap(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  signer: any,
  rpcUrl: string = getLocalHostProviderUrl(ChainId.Mainnet),
) {
  const swapQuoteProvider = new IndexSwapQuoteProvider(rpcUrl)
  return new TestFactory(rpcUrl, signer, swapQuoteProvider)
}
