import {
  LocalhostProvider,
  QuoteTokens,
  SignerAccount5,
  TestFactory,
  transferFromWhale,
  wei,
  wrapETH,
  ZeroExApiSwapQuote,
} from './utils'

const zeroExApi = ZeroExApiSwapQuote

const { dai, eth, mmi, usdc, usdt, weth } = QuoteTokens

describe('MMI (mainnet)', () => {
  let factory: TestFactory
  beforeEach(async () => {
    const provider = LocalhostProvider
    const signer = SignerAccount5
    factory = new TestFactory(provider, signer, zeroExApi)
  })

  test('can mint MMI from ETH', async () => {
    await factory.fetchQuote({
      isMinting: true,
      inputToken: eth,
      outputToken: mmi,
      indexTokenAmount: wei('1'),
      slippage: 0.5,
    })
    await factory.executeTx()
  })

  test.skip('can redeem MMI to ETH', async () => {
    const outputToken = eth
    await factory.fetchQuote({
      isMinting: false,
      inputToken: mmi,
      outputToken,
      indexTokenAmount: wei('1'),
      slippage: 0.5,
    })
    await factory.executeTx()
  })

  test('can mint MMI from DAI', async () => {
    const inputToken = dai
    const quote = await factory.fetchQuote({
      isMinting: true,
      inputToken,
      outputToken: mmi,
      indexTokenAmount: wei('1'),
      slippage: 0.5,
    })
    await transferFromWhale(
      '0x8ce71ef87582b28de89d14970d00b2377f93f32b',
      factory.getSigner().address,
      quote.inputOutputAmount.mul(2),
      inputToken.address,
      factory.getProvider()
    )
    await factory.executeTx()
  })

  test('can redeem MMI to DAI', async () => {
    const outputToken = dai
    await factory.fetchQuote({
      isMinting: false,
      inputToken: mmi,
      outputToken,
      indexTokenAmount: wei('1'),
      slippage: 0.5,
    })
    await factory.executeTx()
  })

  test('can mint MMI from USDC', async () => {
    const inputToken = usdc
    const quote = await factory.fetchQuote({
      isMinting: true,
      inputToken,
      outputToken: mmi,
      indexTokenAmount: wei('1'),
      slippage: 0.5,
    })
    await transferFromWhale(
      '0x7713974908Be4BEd47172370115e8b1219F4A5f0',
      factory.getSigner().address,
      quote.inputOutputAmount,
      inputToken.address,
      factory.getProvider()
    )
    await factory.executeTx()
  })

  test('can redeem MMI to USDC', async () => {
    const outputToken = usdc
    await factory.fetchQuote({
      isMinting: false,
      inputToken: mmi,
      outputToken,
      indexTokenAmount: wei('1'),
      slippage: 0.5,
    })
    await factory.executeTx()
  })

  test('can mint MMI from USDT', async () => {
    const inputToken = usdt
    const quote = await factory.fetchQuote({
      isMinting: true,
      inputToken,
      outputToken: mmi,
      indexTokenAmount: wei('1'),
      slippage: 0.5,
    })
    await transferFromWhale(
      '0x06d3a30cBb00660B85a30988D197B1c282c6dCB6',
      factory.getSigner().address,
      quote.inputOutputAmount,
      inputToken.address,
      factory.getProvider()
    )
    await factory.executeTx()
  })

  test('can redeem MMI to USDT', async () => {
    const outputToken = usdt
    await factory.fetchQuote({
      isMinting: false,
      inputToken: mmi,
      outputToken,
      indexTokenAmount: wei('1'),
      slippage: 0.5,
    })
    await factory.executeTx()
  })

  test('can mint MMI from WETH', async () => {
    const inputToken = weth
    const quote = await factory.fetchQuote({
      isMinting: true,
      inputToken,
      outputToken: mmi,
      indexTokenAmount: wei('1'),
      slippage: 0.5,
    })
    await wrapETH(quote.inputOutputAmount, factory.getSigner())
    await factory.executeTx()
  })

  test('can redeem MMI to WETH', async () => {
    const outputToken = weth
    await factory.fetchQuote({
      isMinting: false,
      inputToken: mmi,
      outputToken,
      indexTokenAmount: wei('1'),
      slippage: 0.5,
    })
    await factory.executeTx()
  })
})
