import { BigNumber } from '@ethersproject/bignumber'

import {
  getMainnetTestFactory,
  getMainnetTestFactoryUniswap,
  QuoteTokens,
  SignerAccount4,
  TestFactory,
  wei,
  wrapETH,
} from './utils'

const { eth, iceth, weth } = QuoteTokens

describe('icETH (mainnet)', () => {
  const signer = SignerAccount4
  let factory: TestFactory
  beforeEach(async () => {
    factory = getMainnetTestFactory(signer)
  })

  test('can mint icETH-ETH', async () => {
    await factory.fetchQuote({
      isMinting: true,
      inputToken: eth,
      outputToken: iceth,
      indexTokenAmount: wei('1'),
      slippage: 0.5,
    })
    await factory.executeTx()
  })

  test('can mint icETH-ETH (IndexSwapQuoteProvider)', async () => {
    const factory = getMainnetTestFactoryUniswap(signer)
    await factory.fetchQuote({
      isMinting: true,
      inputToken: eth,
      outputToken: iceth,
      indexTokenAmount: wei('1'),
      slippage: 0.5,
    })
    await factory.executeTx()
  })

  test('can redeem for ETH', async () => {
    await factory.fetchQuote({
      isMinting: false,
      inputToken: iceth,
      outputToken: eth,
      indexTokenAmount: wei('1'),
      slippage: 0.5,
    })
    await factory.executeTx(BigNumber.from(5_000_000))
  })

  test('can mint with WETH', async () => {
    const quote = await factory.fetchQuote({
      isMinting: true,
      inputToken: weth,
      outputToken: iceth,
      indexTokenAmount: wei('0.1'),
      slippage: 1,
    })
    await wrapETH(quote.inputOutputAmount, factory.getSigner())
    await factory.executeTx()
  })

  test('can mint with WETH (IndexSwapQuoteProvider)', async () => {
    const factory = getMainnetTestFactoryUniswap(signer)
    const quote = await factory.fetchQuote({
      isMinting: true,
      inputToken: weth,
      outputToken: iceth,
      indexTokenAmount: wei('0.1'),
      slippage: 1,
    })
    await wrapETH(quote.inputOutputAmount, factory.getSigner())
    await factory.executeTx()
  })

  test('can redeem for WETH', async () => {
    await factory.fetchQuote({
      isMinting: false,
      inputToken: iceth,
      outputToken: weth,
      indexTokenAmount: wei('0.1'),
      slippage: 1,
    })
    await factory.executeTx()
  })
})
