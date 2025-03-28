import { ChainId } from 'constants/chains'
import {
  getLifiSwapQuoteProvider,
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
  const swapQuoteOutputProviderV2 = getLifiSwapQuoteProvider()
  const rpcUrl = getLocalHostProviderUrl(chainId)
  return new TestFactory(
    rpcUrl,
    signer,
    swapQuoteProvider,
    swapQuoteProviderV2,
    swapQuoteOutputProviderV2,
  )
}
