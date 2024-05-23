/* eslint-disable  @typescript-eslint/no-non-null-assertion */
import { IndexCoopBitcoin2xIndex } from 'constants/tokens'
import {
  getArbitrumTestFactory,
  getSignerAccount,
  LocalhostProviderArbitrum,
  QuoteTokens,
  TestFactory,
  wei,
} from 'tests/utils'

const { eth } = QuoteTokens
const btc2x = {
  address: IndexCoopBitcoin2xIndex.addressArbitrum!,
  decimals: 18,
  symbol: IndexCoopBitcoin2xIndex.symbol,
}

describe('BTC2X (Arbitrum)', () => {
  let factory: TestFactory
  beforeEach(async () => {
    const provider = LocalhostProviderArbitrum
    const signer = getSignerAccount(3, provider)
    factory = getArbitrumTestFactory(provider, signer)
  })

  test('can mint with ETH', async () => {
    await factory.fetchQuote({
      isMinting: true,
      inputToken: eth,
      outputToken: btc2x,
      indexTokenAmount: wei('1'),
      slippage: 0.5,
    })
    await factory.executeTx()
  })

  test('can redeem with ETH', async () => {
    await factory.fetchQuote({
      isMinting: false,
      inputToken: btc2x,
      outputToken: eth,
      indexTokenAmount: wei('1'),
      slippage: 0.5,
    })
    await factory.executeTx()
  })
})
