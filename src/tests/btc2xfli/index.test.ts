import { BigNumber } from '@ethersproject/bignumber'

import {
  getMainnetTestFactory,
  QuoteTokens,
  SignerAccount2,
  TestFactory,
  wei,
} from '../utils'

const { btc2xfli, eth, usdc } = QuoteTokens

describe('BTC2xFLI (mainnet)', () => {
  let factory: TestFactory
  beforeEach(() => {
    const signer = SignerAccount2
    factory = getMainnetTestFactory(signer)
  })

  test('can mint BTC2xFLI', async () => {
    await factory.fetchQuote({
      isMinting: true,
      inputToken: eth,
      outputToken: btc2xfli,
      indexTokenAmount: wei('2'),
      slippage: 1,
    })
    await factory.executeTx()
  })

  test.skip('can redeem BTC2xFLI', async () => {
    await factory.fetchQuote({
      isMinting: false,
      inputToken: btc2xfli,
      outputToken: eth,
      indexTokenAmount: wei('1'),
      slippage: 1,
    })
    await factory.executeTx(BigNumber.from(5_000_000))
  })

  test.skip('can redeem BTC2xFLI for ERC20', async () => {
    await factory.fetchQuote({
      isMinting: false,
      inputToken: btc2xfli,
      outputToken: usdc,
      indexTokenAmount: wei('1'),
      slippage: 1,
    })
    await factory.executeTx(BigNumber.from(5_000_000))
  })
})
