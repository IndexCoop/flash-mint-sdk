import { IndexCoopEthereum3xIndex } from 'constants/tokens'
import {
  LocalhostProviderArbitrum,
  QuoteTokens,
  SignerAccount0Arbitrum,
  TestFactory,
  wei,
  ZeroExApiArbitrumSwapQuote,
} from 'tests/utils'

const { eth } = QuoteTokens
const eth3x = {
  address: IndexCoopEthereum3xIndex.addressArbitrum!,
  decimals: 18,
  symbol: IndexCoopEthereum3xIndex.symbol,
}

describe('ETH3X (Arbitrum)', () => {
  let factory: TestFactory
  beforeEach(async () => {
    const provider = LocalhostProviderArbitrum
    const signer = SignerAccount0Arbitrum
    factory = new TestFactory(provider, signer, ZeroExApiArbitrumSwapQuote)
  })

  test('can mint with ETH', async () => {
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
