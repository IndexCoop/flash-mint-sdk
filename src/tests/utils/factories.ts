import { ChainId } from 'constants/chains'
import { IndexSwapQuoteProvider } from 'quote'
import {
  getLocalHostProviderUrl,
  getSignerAccount,
  getTestRpcProvider,
  getZeroExSwapQuoteProvider,
} from 'tests/utils'
import { TestFactory, TestFactoryV2 } from 'tests/utils/factory'
import { getRpcProvider } from 'utils/rpc-provider'

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

export function getTestFactoryV2ZeroEx(
  signerAccountNo: number,
  chainId = ChainId.Mainnet,
) {
  const localhostUrl = 'http://127.0.0.1:8547/'
  const provider = getRpcProvider(localhostUrl)
  const signer = getSignerAccount(signerAccountNo, provider)
  const swapQuoteProvider = getZeroExSwapQuoteProvider(chainId)
  const rpcUrl = localhostUrl
  return new TestFactoryV2(rpcUrl, signer, swapQuoteProvider)
}

export function getMainnetTestFactoryUniswap(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  signer: any,
  rpcUrl: string = getLocalHostProviderUrl(ChainId.Mainnet),
) {
  const swapQuoteProvider = new IndexSwapQuoteProvider(rpcUrl)
  return new TestFactory(rpcUrl, signer, swapQuoteProvider)
}
