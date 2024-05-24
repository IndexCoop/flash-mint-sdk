import {
  LocalhostProvider,
  QuoteTokens,
  TestFactory,
  SignerAccount1,
  wei,
  IndexZeroExSwapQuoteProvider,
} from '../utils'

const { eth, eth2xfli } = QuoteTokens
const swapQuoteProvider = IndexZeroExSwapQuoteProvider

describe('ETH2xFLI (mainnet)', () => {
  let factory: TestFactory
  beforeAll(async () => {
    const provider = LocalhostProvider
    const signer = SignerAccount1
    factory = new TestFactory(provider, signer, swapQuoteProvider)
  })

  test('can mint ETH2xFLI', async () => {
    await factory.fetchQuote({
      isMinting: true,
      inputToken: eth,
      outputToken: eth2xfli,
      indexTokenAmount: wei('1'),
      slippage: 1,
    })
    await factory.executeTx()
  })

  test.skip('can redeem ETH2xFLI', async () => {
    await factory.fetchQuote({
      isMinting: false,
      inputToken: eth2xfli,
      outputToken: eth,
      indexTokenAmount: wei('1'),
      slippage: 1,
    })
    await factory.executeTx()
  })
})
