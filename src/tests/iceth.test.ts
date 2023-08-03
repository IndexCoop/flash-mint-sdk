import { BigNumber } from '@ethersproject/bignumber'

import {
  LocalhostProvider,
  QuoteTokens,
  SignerAccount4,
  TestFactory,
  wei,
  ZeroExApiSwapQuote,
} from './utils'

const { eth, iceth } = QuoteTokens
const zeroExApi = ZeroExApiSwapQuote

describe('icETH (mainnet)', () => {
  let factory: TestFactory
  beforeEach(async () => {
    const provider = LocalhostProvider
    const signer = SignerAccount4
    factory = new TestFactory(provider, signer, zeroExApi)
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
})
