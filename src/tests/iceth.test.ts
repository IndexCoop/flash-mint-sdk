import { BigNumber } from '@ethersproject/bignumber'

import {
  getMainnetTestFactory,
  LocalhostProvider,
  QuoteTokens,
  SignerAccount4,
  TestFactory,
  wei,
  wrapETH,
} from './utils'

const { eth, iceth, weth } = QuoteTokens

describe('icETH (mainnet)', () => {
  let factory: TestFactory
  beforeEach(async () => {
    const provider = LocalhostProvider
    const signer = SignerAccount4
    factory = getMainnetTestFactory(provider, signer)
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
