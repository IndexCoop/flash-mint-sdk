import { getTokenByChainAndSymbol } from '@indexcoop/tokenlists'
import { QuoteTokens, getTestFactoryZeroEx, wei } from './utils'

import type { TestFactory } from './utils'

describe('BTC2X (mainnet)', () => {
  const chainId = 1
  const btc2x = getTokenByChainAndSymbol(chainId, 'BTC2X')
  const { eth } = QuoteTokens
  let factory: TestFactory
  beforeEach(async () => {
    factory = getTestFactoryZeroEx(4)
  })

  test('can mint with ETH', async () => {
    await factory.fetchQuote({
      isMinting: true,
      inputToken: eth,
      outputToken: btc2x,
      indexTokenAmount: wei('1').toString(),
      slippage: 0.5,
    })
    await factory.executeTx()
  })

  test.skip('can redeem with ETH', async () => {
    await factory.fetchQuote({
      isMinting: false,
      inputToken: btc2x,
      outputToken: eth,
      indexTokenAmount: wei('1').toString(),
      slippage: 0.5,
    })
    await factory.executeTx()
  })
})
