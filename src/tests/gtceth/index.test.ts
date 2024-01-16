import { wei } from 'utils/numbers'

import {
  LocalhostProvider,
  QuoteTokens,
  SignerAccount0,
  TestFactory,
  wrapETH,
  ZeroExApiSwapQuote,
} from '../utils'

const { eth, gtcETH, weth } = QuoteTokens
const zeroExApi = ZeroExApiSwapQuote

// Works locally, fails on github actions for some reason.
describe('gtcETH (mainnet)', () => {
  let factory: TestFactory
  beforeEach(async () => {
    const provider = LocalhostProvider
    const signer = SignerAccount0
    factory = new TestFactory(provider, signer, zeroExApi)
  })

  test('minting with ETH', async () => {
    await factory.fetchQuote({
      isMinting: true,
      inputToken: eth,
      outputToken: gtcETH,
      indexTokenAmount: wei('0.1'),
      slippage: 0.5,
    })
    await factory.executeTx()
  })

  test.skip('minting with WETH', async () => {
    await factory.fetchQuote({
      isMinting: true,
      inputToken: weth,
      outputToken: gtcETH,
      indexTokenAmount: wei('0.1'),
      slippage: 0.5,
    })
    await wrapETH(wei(2), factory.getSigner())
    await factory.executeTx()
  })
})
