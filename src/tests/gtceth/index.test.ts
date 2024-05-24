import { wei } from 'utils/numbers'

import {
  getMainnetTestFactory,
  QuoteTokens,
  SignerAccount0,
  TestFactory,
  wrapETH,
} from '../utils'

const { eth, gtcETH, weth } = QuoteTokens

// Works locally, fails on github actions for some reason.
describe.skip('gtcETH (mainnet)', () => {
  let factory: TestFactory
  beforeEach(async () => {
    const signer = SignerAccount0
    factory = getMainnetTestFactory(signer)
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
