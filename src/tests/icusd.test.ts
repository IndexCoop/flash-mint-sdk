import {
  getMainnetTestFactory,
  QuoteTokens,
  SignerAccount4,
  TestFactory,
  transferFromWhale,
  wei,
} from './utils'

const { icusd, usdc } = QuoteTokens

describe.skip('icUSD (mainnet)', () => {
  const indexToken = icusd
  const signer = SignerAccount4
  let factory: TestFactory
  beforeEach(async () => {
    factory = getMainnetTestFactory(signer)
  })

  test('can mint with USDC', async () => {
    const quote = await factory.fetchQuote({
      isMinting: true,
      inputToken: usdc,
      outputToken: indexToken,
      indexTokenAmount: wei('1'),
      inputTokenAmount: wei(100, 6),
      slippage: 0.5,
    })
    const usdcWhale = '0x7713974908Be4BEd47172370115e8b1219F4A5f0'
    await transferFromWhale(
      usdcWhale,
      factory.getSigner().address,
      wei('100000', quote.inputToken.decimals),
      quote.inputToken.address,
      factory.getProvider()
    )
    await factory.executeTx()
  })

  test('can redeem to USDC', async () => {
    await factory.fetchQuote({
      isMinting: false,
      inputToken: indexToken,
      outputToken: usdc,
      indexTokenAmount: wei('1'),
      inputTokenAmount: wei(100, 6),
      slippage: 0.5,
    })
    await factory.executeTx()
  })
})
