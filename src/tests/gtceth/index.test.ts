import { wei } from 'utils/numbers'

import {
  getMainnetTestFactory,
  QuoteTokens,
  SignerAccount0,
  TestFactory,
} from '../utils'

const { eth, gtcETH } = QuoteTokens

// Does not work atm because of 0x quotes
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
      indexTokenAmount: wei('0.1').toString(),
      slippage: 0.5,
    })
    await factory.executeTx()
  })
})
