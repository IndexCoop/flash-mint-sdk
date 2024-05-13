/* eslint-disable  @typescript-eslint/no-non-null-assertion */
import { IndexCoopInverseBitcoinIndex } from 'constants/tokens'
import {
  getSignerAccount,
  LocalhostProviderArbitrum,
  QuoteTokens,
  TestFactory,
  wei,
  ZeroExApiArbitrumSwapQuote,
} from 'tests/utils'

const { eth } = QuoteTokens
const ibtc1x = {
  address: IndexCoopInverseBitcoinIndex.addressArbitrum!,
  decimals: 18,
  symbol: IndexCoopInverseBitcoinIndex.symbol,
}

describe('iBTC1X (Arbitrum)', () => {
  let factory: TestFactory
  beforeEach(async () => {
    const provider = LocalhostProviderArbitrum
    const signer = getSignerAccount(4, provider)
    factory = new TestFactory(provider, signer, ZeroExApiArbitrumSwapQuote)
  })

  test('can mint with ETH', async () => {
    await factory.fetchQuote({
      isMinting: true,
      inputToken: eth,
      outputToken: ibtc1x,
      indexTokenAmount: wei('1'),
      slippage: 0.5,
    })
    await factory.executeTx()
  })

  test('can redeem with ETH', async () => {
    await factory.fetchQuote({
      isMinting: false,
      inputToken: ibtc1x,
      outputToken: eth,
      indexTokenAmount: wei('1'),
      slippage: 0.5,
    })
    await factory.executeTx()
  })
})
