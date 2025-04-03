import { ChainId } from 'constants/chains'
import {
  getLifiSwapQuoteProvider,
  getLocalHostProviderUrl,
  getSignerAccount,
  getTestRpcProvider,
  getZeroExV2SwapQuoteProvider,
} from 'tests/utils'
import { TestFactory } from 'tests/utils/factory'

export function getTestFactoryZeroExV2(
  signerAccountNo: number,
  chainId = ChainId.Mainnet,
) {
  const provider = getTestRpcProvider(chainId)
  const signer = getSignerAccount(signerAccountNo, provider)
  const swapQuoteProviderV2 = getZeroExV2SwapQuoteProvider()
  const swapQuoteOutputProviderV2 = getLifiSwapQuoteProvider()
  const rpcUrl = getLocalHostProviderUrl(chainId)
  return new TestFactory(
    rpcUrl,
    signer,
    swapQuoteProviderV2,
    swapQuoteOutputProviderV2,
  )
}
