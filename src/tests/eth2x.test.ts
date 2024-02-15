import {
  LocalhostProvider,
  QuoteTokens,
  SignerAccount4,
  TestFactory,
  wei,
  ZeroExApiSwapQuote,
} from './utils'

const { eth, eth2x } = QuoteTokens
const zeroExApi = ZeroExApiSwapQuote

describe.skip('ETH2X (mainnet)', () => {
  let factory: TestFactory
  beforeEach(async () => {
    const provider = LocalhostProvider
    const signer = SignerAccount4
    factory = new TestFactory(provider, signer, zeroExApi)
  })

  test('can mint with ETH', async () => {
    await factory.fetchQuote({
      isMinting: true,
      inputToken: eth,
      outputToken: eth2x,
      indexTokenAmount: wei('1'),
      slippage: 0.5,
    })
    await factory.executeTx()
  })

  test('can redeem with ETH', async () => {
    await factory.fetchQuote({
      isMinting: false,
      inputToken: eth2x,
      outputToken: eth,
      indexTokenAmount: wei('1'),
      slippage: 0.5,
    })
    await factory.executeTx()
  })
})
