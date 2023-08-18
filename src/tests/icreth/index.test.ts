import {
  LocalhostProvider,
  QuoteTokens,
  resetHardhat,
  SignerAccount2,
  TestFactory,
  transferFromWhale,
  wei,
  wrapETH,
  ZeroExApiSwapQuote,
} from '../utils'
import {
  mintQuoteUsdc1,
  mintQuoteUsdc2,
  redeemQuoteUsdc1,
  redeemQuoteUsdc2,
} from './quotes'

const { eth, icreth, reth, usdc, weth } = QuoteTokens

const signer = SignerAccount2
const zeroExApi = ZeroExApiSwapQuote
const zeroExMock = jest.spyOn(zeroExApi, 'getSwapQuote')

describe('icRETH (mainnet) - ETH', () => {
  let factory: TestFactory
  beforeAll(async () => {
    const provider = LocalhostProvider
    factory = new TestFactory(provider, signer, zeroExApi)
  })

  test('can mint icRETH', async () => {
    await factory.fetchQuote({
      isMinting: true,
      inputToken: eth,
      outputToken: icreth,
      indexTokenAmount: wei('0.1'),
      slippage: 1,
    })
    await factory.executeTx()
  })

  test('can redeem icRETH for ETH', async () => {
    await factory.fetchQuote({
      isMinting: false,
      inputToken: icreth,
      outputToken: eth,
      indexTokenAmount: wei('0.1'),
      slippage: 1,
    })
    await factory.executeTx()
  })
})

describe('icRETH (mainnet) - rETH', () => {
  let factory: TestFactory
  beforeAll(async () => {
    const provider = LocalhostProvider
    factory = new TestFactory(provider, signer, zeroExApi)
  })

  test('can mint icRETH', async () => {
    const rethWhale = '0x7d6149aD9A573A6E2Ca6eBf7D4897c1B766841B4'
    const quote = await factory.fetchQuote({
      isMinting: true,
      inputToken: reth,
      outputToken: icreth,
      indexTokenAmount: wei('0.1'),
      slippage: 1,
    })
    await transferFromWhale(
      rethWhale,
      factory.getSigner().address,
      wei(100),
      quote.inputToken.address,
      factory.getProvider()
    )
    await factory.executeTx()
  })

  test('can redeem icRETH for rETH', async () => {
    await factory.fetchQuote({
      isMinting: false,
      inputToken: icreth,
      outputToken: reth,
      indexTokenAmount: wei('0.1'),
      slippage: 1,
    })
    await factory.executeTx()
  })
})

describe('icRETH (mainnet) - USDC', () => {
  let factory: TestFactory
  beforeAll(async () => {
    zeroExMock
      .mockImplementationOnce(async () => {
        return mintQuoteUsdc1
      })
      .mockImplementationOnce(async () => {
        return mintQuoteUsdc2
      })
      .mockImplementationOnce(async () => {
        return redeemQuoteUsdc1
      })
      .mockImplementationOnce(async () => {
        return redeemQuoteUsdc2
      })
    const blockNumber = 17940000
    const provider = LocalhostProvider
    await resetHardhat(provider, blockNumber)
    factory = new TestFactory(provider, signer, zeroExApi)
  })

  test('can mint icRETH', async () => {
    const usdcWhale = '0x7713974908Be4BEd47172370115e8b1219F4A5f0'
    const quote = await factory.fetchQuote({
      isMinting: true,
      inputToken: usdc,
      outputToken: icreth,
      indexTokenAmount: wei('0.1'),
      slippage: 1,
    })
    await transferFromWhale(
      usdcWhale,
      factory.getSigner().address,
      wei(5000, 6),
      quote.inputToken.address,
      factory.getProvider()
    )
    await factory.executeTx()
  })

  test('can redeem icRETH for USDC', async () => {
    await factory.fetchQuote({
      isMinting: false,
      inputToken: icreth,
      outputToken: usdc,
      indexTokenAmount: wei('0.1'),
      slippage: 1,
    })
    await factory.executeTx()
  })
})

describe('icRETH (mainnet) - WETH', () => {
  let factory: TestFactory
  beforeAll(async () => {
    const provider = LocalhostProvider
    factory = new TestFactory(provider, signer, zeroExApi)
  })

  test('can mint icRETH', async () => {
    const quote = await factory.fetchQuote({
      isMinting: true,
      inputToken: weth,
      outputToken: icreth,
      indexTokenAmount: wei('0.1'),
      slippage: 1,
    })
    await wrapETH(quote.inputOutputAmount, factory.getSigner())
    await factory.executeTx()
  })

  test('can redeem icRETH for WETH', async () => {
    await factory.fetchQuote({
      isMinting: false,
      inputToken: icreth,
      outputToken: weth,
      indexTokenAmount: wei('0.1'),
      slippage: 1,
    })
    await factory.executeTx()
  })
})
