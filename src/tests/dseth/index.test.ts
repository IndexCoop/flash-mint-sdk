import { getTokenByChainAndSymbol } from '@indexcoop/tokenlists'

import {
  QuoteTokens,
  type TestFactory,
  addLiquidityToLido,
  getTestFactoryZeroEx,
  swapExactInput,
  transferFromWhale,
  wei,
  wrapETH,
} from '../utils'

describe('dsETH (mainnet)', () => {
  const chainId = 1
  const dseth = getTokenByChainAndSymbol(chainId, 'dsETH')
  const { eth, steth, usdc, weth } = QuoteTokens
  let factory: TestFactory
  beforeEach(async () => {
    factory = getTestFactoryZeroEx(3)
  })

  test.only('minting with ETH', async () => {
    await factory.fetchQuote({
      isMinting: true,
      inputToken: eth,
      outputToken: dseth,
      indexTokenAmount: wei('0.1').toString(),
      slippage: 1,
    })
    await factory.executeTx()
  })

  test('redeeming to ETH', async () => {
    await factory.fetchQuote({
      isMinting: false,
      inputToken: dseth,
      outputToken: eth,
      indexTokenAmount: wei('0.1').toString(),
      slippage: 1,
    })
    await factory.executeTx()
  })

  test('minting with WETH', async () => {
    const quote = await factory.fetchQuote({
      isMinting: true,
      inputToken: weth,
      outputToken: dseth,
      indexTokenAmount: wei('0.1').toString(),
      slippage: 1,
    })
    await wrapETH(quote.inputOutputAmount, factory.getSigner())
    await factory.executeTx()
  })

  test('redeeming to WETH', async () => {
    await factory.fetchQuote({
      isMinting: false,
      inputToken: dseth,
      outputToken: weth,
      indexTokenAmount: wei('0.1').toString(),
      slippage: 1,
    })
    await factory.executeTx()
  })

  test('minting with rETH', async () => {
    const quote = await factory.fetchQuote({
      isMinting: true,
      inputToken: getTokenByChainAndSymbol(1, 'rETH'),
      outputToken: dseth,
      indexTokenAmount: wei('0.1').toString(),
      slippage: 1,
    })
    const rethWhale = '0x7d6149aD9A573A6E2Ca6eBf7D4897c1B766841B4'
    await transferFromWhale(
      rethWhale,
      factory.getSigner().address,
      quote.inputOutputAmount,
      quote.inputToken.address,
      factory.getProvider(),
    )
    await factory.executeTx()
  })

  test('redeeming to rETH', async () => {
    await factory.fetchQuote({
      isMinting: false,
      inputToken: dseth,
      outputToken: getTokenByChainAndSymbol(1, 'rETH'),
      indexTokenAmount: wei('0.1').toString(),
      slippage: 1,
    })
    await factory.executeTx()
  })

  test('minting with sETH2', async () => {
    const quote = await factory.fetchQuote({
      isMinting: true,
      inputToken: getTokenByChainAndSymbol(1, 'sETH2'),
      outputToken: dseth,
      indexTokenAmount: wei('0.1').toString(),
      slippage: 1,
    })
    // ETH / sETH2
    const pool = '0x7379e81228514a1d2a6cf7559203998e20598346'
    await wrapETH(wei(2), factory.getSigner())
    await swapExactInput(
      pool,
      {
        tokenIn: weth.address,
        tokenOut: quote.inputToken.address,
        amountIn: wei('2'),
        amountOutMin: wei('1.5'),
      },
      factory.getProvider(),
      factory.getSigner(),
    )
    await factory.executeTx()
  })

  test('redeeming to sETH2', async () => {
    await factory.fetchQuote({
      isMinting: false,
      inputToken: dseth,
      outputToken: getTokenByChainAndSymbol(1, 'sETH2'),
      indexTokenAmount: wei('0.1').toString(),
      slippage: 1,
    })
    await factory.executeTx()
  })

  test('minting with stETH', async () => {
    await factory.fetchQuote({
      isMinting: true,
      inputToken: steth,
      outputToken: dseth,
      indexTokenAmount: wei('0.1').toString(),
      slippage: 1,
    })
    await addLiquidityToLido(wei('2'), factory.getSigner())
    await factory.executeTx()
  })

  test('redeeming to stETH', async () => {
    await factory.fetchQuote({
      isMinting: false,
      inputToken: dseth,
      outputToken: steth,
      indexTokenAmount: wei('0.1').toString(),
      slippage: 1,
    })
    await factory.executeTx()
  })

  test('minting with USDC', async () => {
    const quote = await factory.fetchQuote({
      isMinting: true,
      inputToken: usdc,
      outputToken: dseth,
      indexTokenAmount: wei('0.1').toString(),
      slippage: 1,
    })
    const whale = '0x7713974908Be4BEd47172370115e8b1219F4A5f0'
    await transferFromWhale(
      whale,
      factory.getSigner().address,
      wei('10000', quote.inputToken.decimals),
      quote.inputToken.address,
      factory.getProvider(),
    )
    await factory.executeTx()
  })

  test('redeeming to USDC', async () => {
    await factory.fetchQuote({
      isMinting: false,
      inputToken: dseth,
      outputToken: usdc,
      indexTokenAmount: wei('0.1').toString(),
      slippage: 1,
    })
    await factory.executeTx()
  })
})
