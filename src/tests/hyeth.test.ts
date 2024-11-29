import {
  getMainnetTestFactory,
  getMainnetTestFactoryUniswap,
  QuoteTokens,
  SignerAccount4,
  TestFactory,
  transferFromWhale,
  wei,
} from './utils'

const { eth, hyeth, usdc } = QuoteTokens

describe('hyETH', () => {
  const indexToken = hyeth
  const signer = SignerAccount4
  let factory: TestFactory
  beforeEach(async () => {
    factory = getMainnetTestFactory(signer)
  })

  // IndexSwapQuoteProvider

  test.skip('can mint with ETH (IndexSwapQuoteProvider)', async () => {
    const factory = getMainnetTestFactoryUniswap(signer)
    await factory.fetchQuote({
      isMinting: true,
      inputToken: eth,
      outputToken: indexToken,
      indexTokenAmount: wei('1').toString(),
      slippage: 0.5,
    })
    await factory.executeTx()
  })

  test.skip('can mint with USDC (IndexSwapQuoteProvider)', async () => {
    const factory = getMainnetTestFactoryUniswap(signer)
    const quote = await factory.fetchQuote({
      isMinting: true,
      inputToken: usdc,
      outputToken: indexToken,
      indexTokenAmount: wei('1').toString(),
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

  test.skip('can redeem to ETH (IndexSwapQuoteProvider)', async () => {
    const factory = getMainnetTestFactoryUniswap(signer)
    await factory.fetchQuote({
      isMinting: false,
      inputToken: indexToken,
      outputToken: eth,
      indexTokenAmount: wei('1').toString(),
      slippage: 0.5,
    })
    await factory.executeTx()
  })

  // 0x

  test('can mint with ETH', async () => {
    await factory.fetchQuote({
      isMinting: true,
      inputToken: eth,
      outputToken: indexToken,
      indexTokenAmount: wei('1').toString(),
      slippage: 0.5,
    })
    await factory.executeTx()
  })

  test.skip('can mint with ETH (large amout)', async () => {
    await factory.fetchQuote({
      isMinting: true,
      inputToken: eth,
      outputToken: indexToken,
      indexTokenAmount: wei('550').toString(),
      slippage: 0.5,
    })
    await factory.executeTx()
  })

  test.skip('can mint with USDC', async () => {
    const quote = await factory.fetchQuote({
      isMinting: true,
      inputToken: usdc,
      outputToken: indexToken,
      indexTokenAmount: wei('1').toString(),
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
    const quote = await factory.fetchQuote({
      isMinting: false,
      inputToken: indexToken,
      outputToken: eth,
      indexTokenAmount: wei('1').toString(),
      slippage: 0.5,
    })
    const whale = '0x6e2C509D522d47F509E1a6D75682E6AbBC38B362'
    await transferFromWhale(
      whale,
      factory.getSigner().address,
      quote.indexTokenAmount,
      quote.inputToken.address,
      factory.getProvider()
    )
    await factory.executeTx()
  })

  test.skip('can redeem to ETH (large amount)', async () => {
    await factory.fetchQuote({
      isMinting: false,
      inputToken: indexToken,
      outputToken: eth,
      indexTokenAmount: wei('200').toString(),
      slippage: 0.5,
    })
    await factory.executeTx()
  })

  test('can redeem to USDC', async () => {
    const quote = await factory.fetchQuote({
      isMinting: false,
      inputToken: indexToken,
      outputToken: eth,
      indexTokenAmount: wei('1').toString(),
      slippage: 0.5,
    })
    const whale = '0x6e2C509D522d47F509E1a6D75682E6AbBC38B362'
    await transferFromWhale(
      whale,
      factory.getSigner().address,
      quote.indexTokenAmount,
      quote.inputToken.address,
      factory.getProvider()
    )
    await factory.executeTx()
  })
})
