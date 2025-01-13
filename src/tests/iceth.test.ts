import { BigNumber } from '@ethersproject/bignumber'
import { getTokenByChainAndSymbol } from '@indexcoop/tokenlists'

import {
  QuoteTokens,
  type TestFactory,
  getTestFactoryZeroEx,
  getMainnetTestFactoryUniswap,
  wei,
  wrapETH,
} from './utils'

describe('icETH (mainnet)', () => {
  const chainId = 1
  const { eth } = QuoteTokens
  const iceth = getTokenByChainAndSymbol(chainId, 'icETH')
  const weth = getTokenByChainAndSymbol(chainId, 'WETH')
  let factory: TestFactory
  beforeEach(async () => {
    factory = getTestFactoryZeroEx(4)
  })

  test('can mint icETH-ETH', async () => {
    await factory.fetchQuote({
      isMinting: true,
      inputToken: eth,
      outputToken: iceth,
      indexTokenAmount: wei('1').toString(),
      slippage: 0.5,
    })
    await factory.executeTx()
  })

  test.skip('can mint icETH-ETH (IndexSwapQuoteProvider)', async () => {
    const uniFactory = getMainnetTestFactoryUniswap(factory.getSigner())
    await uniFactory.fetchQuote({
      isMinting: true,
      inputToken: eth,
      outputToken: iceth,
      indexTokenAmount: wei('1').toString(),
      slippage: 0.5,
    })
    await uniFactory.executeTx()
  })

  test('can redeem for ETH', async () => {
    await factory.fetchQuote({
      isMinting: false,
      inputToken: iceth,
      outputToken: eth,
      indexTokenAmount: wei('1').toString(),
      slippage: 0.5,
    })
    await factory.executeTx(BigNumber.from(5_000_000))
  })

  test('can mint with WETH', async () => {
    const quote = await factory.fetchQuote({
      isMinting: true,
      inputToken: weth,
      outputToken: iceth,
      indexTokenAmount: wei('0.1').toString(),
      slippage: 1,
    })
    await wrapETH(quote.inputOutputAmount, factory.getSigner())
    await factory.executeTx()
  })

  test.skip('can mint with WETH (IndexSwapQuoteProvider)', async () => {
    const uniFactory = getMainnetTestFactoryUniswap(factory.getSigner())
    const quote = await factory.fetchQuote({
      isMinting: true,
      inputToken: weth,
      outputToken: iceth,
      indexTokenAmount: wei('0.1').toString(),
      slippage: 1,
    })
    await wrapETH(quote.inputOutputAmount, uniFactory.getSigner())
    await uniFactory.executeTx()
  })

  test('can redeem for WETH', async () => {
    await factory.fetchQuote({
      isMinting: false,
      inputToken: iceth,
      outputToken: weth,
      indexTokenAmount: wei('0.1').toString(),
      slippage: 1,
    })
    await factory.executeTx()
  })
})
