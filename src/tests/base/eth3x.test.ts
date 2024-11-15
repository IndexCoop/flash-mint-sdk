/* eslint-disable  @typescript-eslint/no-non-null-assertion */
import { ChainId } from 'constants/chains'
import { IndexCoopEthereum3xIndex } from 'constants/tokens'
import {
  getBaseTestFactory,
  getLocalHostProviderUrl,
  getSignerAccount,
  QuoteTokens,
  TestFactory,
  wei,
} from 'tests/utils'
import { getRpcProvider } from 'utils/rpc-provider'

const { eth } = QuoteTokens
const eth3x = {
  address: IndexCoopEthereum3xIndex.addressBase!,
  decimals: 18,
  symbol: IndexCoopEthereum3xIndex.symbol,
}

describe.skip('ETH3X (Base)', () => {
  let factory: TestFactory
  beforeEach(async () => {
    const provider = getRpcProvider(getLocalHostProviderUrl(ChainId.Base))
    const signer = getSignerAccount(2, provider)
    factory = getBaseTestFactory(signer)
  })

  test.only('can mint with ETH', async () => {
    await factory.fetchQuote({
      isMinting: true,
      inputToken: eth,
      outputToken: eth3x,
      indexTokenAmount: wei('1'),
      slippage: 0.5,
    })
    await factory.executeTx()
  })

  test('can redeem with ETH', async () => {
    await factory.fetchQuote({
      isMinting: false,
      inputToken: eth3x,
      outputToken: eth,
      indexTokenAmount: wei('1'),
      slippage: 0.5,
    })
    await factory.executeTx()
  })
})
