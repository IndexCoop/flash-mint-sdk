/* eslint-disable  @typescript-eslint/no-non-null-assertion */
import { IndexCoopEthereum2xIndex } from 'constants/tokens'
import {
  getBaseTestFactory,
  getSignerAccount,
  LocalhostProviderBase,
  QuoteTokens,
  TestFactory,
  wei,
} from 'tests/utils'

const { eth } = QuoteTokens
const eth2x = {
  address: IndexCoopEthereum2xIndex.addressBase!,
  decimals: 18,
  symbol: IndexCoopEthereum2xIndex.symbol,
}

describe('ETH2X (Base)', () => {
  let factory: TestFactory
  beforeEach(async () => {
    const provider = LocalhostProviderBase
    const signer = getSignerAccount(0, provider)
    factory = getBaseTestFactory(signer)
  })

  test('can mint with ETH', async () => {
    await factory.fetchQuote({
      isMinting: true,
      inputToken: eth,
      outputToken: eth2x,
      indexTokenAmount: wei('1'),
      slippage: 0.5,
    })
    await factory.executeTx()
  })

  test('can redeem with ETH', async () => {
    await factory.fetchQuote({
      isMinting: false,
      inputToken: eth2x,
      outputToken: eth,
      indexTokenAmount: wei('1'),
      slippage: 0.5,
    })
    await factory.executeTx()
  })
})
