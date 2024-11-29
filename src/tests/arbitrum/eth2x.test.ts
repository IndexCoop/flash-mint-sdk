/* eslint-disable  @typescript-eslint/no-non-null-assertion */
import { IndexCoopEthereum2xIndex } from 'constants/tokens'
import {
  getArbitrumTestFactory,
  getSignerAccount,
  LocalhostProviderArbitrum,
  QuoteTokens,
  TestFactory,
  wei,
} from 'tests/utils'

const { eth } = QuoteTokens
const eth2x = {
  address: IndexCoopEthereum2xIndex.addressArbitrum!,
  decimals: 18,
  symbol: IndexCoopEthereum2xIndex.symbol,
}

describe('ETH2X (Arbitrum)', () => {
  let factory: TestFactory
  beforeEach(async () => {
    const provider = LocalhostProviderArbitrum
    const signer = getSignerAccount(0, provider)
    factory = getArbitrumTestFactory(signer)
  })

  test('can mint with ETH', async () => {
    await factory.fetchQuote({
      isMinting: true,
      inputToken: eth,
      outputToken: eth2x,
      indexTokenAmount: wei('1').toString(),
      slippage: 0.5,
    })
    await factory.executeTx()
  })

  test('can redeem with ETH', async () => {
    await factory.fetchQuote({
      isMinting: false,
      inputToken: eth2x,
      outputToken: eth,
      indexTokenAmount: wei('1').toString(),
      slippage: 0.5,
    })
    await factory.executeTx()
  })
})
