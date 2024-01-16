import {
  LocalhostProvider,
  QuoteTokens,
  SignerAccount5,
  TestFactory,
  transferFromWhale,
  wei,
  ZeroExApiSwapQuote,
} from '../utils'

const { cdeti, eth, usdc } = QuoteTokens
const zeroExApi = ZeroExApiSwapQuote

describe('cdETI (mainnet)', () => {
  let factory: TestFactory
  beforeEach(async () => {
    const provider = LocalhostProvider
    const signer = SignerAccount5
    factory = new TestFactory(provider, signer, zeroExApi)
  })

  test('minting with ETH', async () => {
    await factory.fetchQuote({
      isMinting: true,
      inputToken: eth,
      outputToken: cdeti,
      indexTokenAmount: wei('1'),
      slippage: 0.5,
    })
    await factory.executeTx()
  })

  test('redeeming to ETH', async () => {
    await factory.fetchQuote({
      isMinting: false,
      inputToken: cdeti,
      outputToken: eth,
      indexTokenAmount: wei('1'),
      slippage: 0.5,
    })
    await factory.executeTx()
  })

  test('minting with USDC', async () => {
    const quote = await factory.fetchQuote({
      isMinting: true,
      inputToken: usdc,
      outputToken: cdeti,
      indexTokenAmount: wei('0.2'),
      slippage: 0.5,
    })
    const whale = '0x7713974908Be4BEd47172370115e8b1219F4A5f0'
    await transferFromWhale(
      whale,
      factory.getSigner().address,
      wei('10000', quote.inputToken.decimals),
      quote.inputToken.address,
      factory.getProvider()
    )
    await factory.executeTx()
  })

  test('redeeming to USDC', async () => {
    await factory.fetchQuote({
      isMinting: false,
      inputToken: cdeti,
      outputToken: usdc,
      indexTokenAmount: wei('0.2'),
      slippage: 0.5,
    })
    await factory.executeTx()
  })
})
