import {
  getMainnetTestFactory,
  getMainnetTestFactoryUniswap,
  QuoteTokens,
  SignerAccount4,
  TestFactory,
  wei,
} from './utils'

const { eth, eth2x } = QuoteTokens

describe('ETH2X (mainnet)', () => {
  const signer = SignerAccount4
  let factory: TestFactory
  beforeEach(async () => {
    factory = getMainnetTestFactory(signer)
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

  test('can mint with ETH (IndexSwapQuoteProvider)', async () => {
    const factory = getMainnetTestFactoryUniswap(signer)
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

  test('can redeem with ETH (IndexSwapQuoteProvider)', async () => {
    const factory = getMainnetTestFactoryUniswap(signer)
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
