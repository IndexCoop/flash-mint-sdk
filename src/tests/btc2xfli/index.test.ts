import { BigNumber } from '@ethersproject/bignumber'

import {
  LocalhostProvider,
  QuoteTokens,
  SignerAccount2,
  TestFactory,
  wei,
  ZeroExApiSwapQuote,
} from '../utils'

const { btc2xfli, eth, usdc } = QuoteTokens

describe('BTC2xFLI (mainnet)', () => {
  let factory: TestFactory
  beforeEach(() => {
    const provider = LocalhostProvider
    const signer = SignerAccount2
    const zeroExApi = ZeroExApiSwapQuote
    factory = new TestFactory(provider, signer, zeroExApi)
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
