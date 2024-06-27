import {
  getMainnetTestFactory,
  QuoteTokens,
  SignerAccount4,
  TestFactory,
  transferFromWhale,
  wei,
} from './utils'

const { eth, hyeth, usdc } = QuoteTokens

describe('hyETH', () => {
  const indexToken = hyeth
  let factory: TestFactory
  beforeEach(async () => {
    const signer = SignerAccount4
    factory = getMainnetTestFactory(signer)
  })

  test('can mint with ETH', async () => {
    await factory.fetchQuote({
      isMinting: true,
      inputToken: eth,
      outputToken: indexToken,
      indexTokenAmount: wei('1'),
      slippage: 0.5,
    })
    await factory.executeTx()
  })

  test.skip('can mint with ETH (large amout)', async () => {
    await factory.fetchQuote({
      isMinting: true,
      inputToken: eth,
      outputToken: indexToken,
      indexTokenAmount: wei('300'),
      slippage: 0.5,
    })
    await factory.executeTx()
  })

  test('can mint with USDC', async () => {
    const quote = await factory.fetchQuote({
      isMinting: true,
      inputToken: usdc,
      outputToken: indexToken,
      indexTokenAmount: wei('1'),
      slippage: 0.5,
    })
    const whale = '0x7713974908Be4BEd47172370115e8b1219F4A5f0'
    await transferFromWhale(
      whale,
      factory.getSigner().address,
      wei('100000', quote.inputToken.decimals),
      quote.inputToken.address,
      factory.getProvider()
    )
    await factory.executeTx()
  })

  test('can redeem to ETH', async () => {
    await factory.fetchQuote({
      isMinting: false,
      inputToken: indexToken,
      outputToken: eth,
      indexTokenAmount: wei('1'),
      slippage: 0.5,
    })
    await factory.executeTx()
  })

  test.skip('can redeem to ETH (large amount)', async () => {
    await factory.fetchQuote({
      isMinting: false,
      inputToken: indexToken,
      outputToken: eth,
      indexTokenAmount: wei('200'),
      slippage: 0.5,
    })
    await factory.executeTx()
  })

  test('can redeem to USDC', async () => {
    await factory.fetchQuote({
      isMinting: false,
      inputToken: indexToken,
      outputToken: eth,
      indexTokenAmount: wei('1'),
      slippage: 0.5,
    })
    await factory.executeTx()
  })
})
