/* eslint-disable  @typescript-eslint/no-non-null-assertion */
import { IndexCoopBitcoin3xIndex } from 'constants/tokens'
import {
  getSignerAccount,
  LocalhostProviderArbitrum,
  QuoteTokens,
  TestFactory,
  wei,
  ZeroExApiArbitrumSwapQuote,
} from 'tests/utils'

const { eth } = QuoteTokens
const eth3x = {
  address: IndexCoopBitcoin3xIndex.addressArbitrum!,
  decimals: 18,
  symbol: IndexCoopBitcoin3xIndex.symbol,
}

describe.skip('BTC3X (Arbitrum)', () => {
  let factory: TestFactory
  beforeEach(async () => {
    const provider = LocalhostProviderArbitrum
    const signer = getSignerAccount(5, provider)
    factory = new TestFactory(provider, signer, ZeroExApiArbitrumSwapQuote)
  })

  test('can mint with ETH', async () => {
    await factory.fetchQuote({
      isMinting: true,
      inputToken: eth,
      outputToken: eth3x,
      indexTokenAmount: wei('1'),
      slippage: 1,
    })
    await factory.executeTx()
  })

  test('can redeem with ETH', async () => {
    await factory.fetchQuote({
      isMinting: false,
      inputToken: eth3x,
      outputToken: eth,
      indexTokenAmount: wei('1'),
      slippage: 1,
    })
    await factory.executeTx()
  })
})
