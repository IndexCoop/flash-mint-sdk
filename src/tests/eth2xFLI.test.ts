import { wei } from 'utils/numbers'

import { TestFactory } from './factories'
import {
  LocalhostProvider,
  QuoteTokens,
  SignerAccount1,
  ZeroExApiSwapQuote,
} from './utils'

const { eth, eth2xfli } = QuoteTokens
const zeroExApi = ZeroExApiSwapQuote

describe('ETH2xFLI (mainnet)2', () => {
  let factory: TestFactory
  beforeAll(() => {
    const provider = LocalhostProvider
    const signer = SignerAccount1
    factory = new TestFactory(provider, signer, zeroExApi)
  })

  test('can mint ETH2xFLI', async () => {
    await factory.fetchQuote({
      isMinting: true,
      inputToken: eth,
      outputToken: eth2xfli,
      indexTokenAmount: wei('1'),
      slippage: 1,
    })
    await factory.executeTx()
  })
})
