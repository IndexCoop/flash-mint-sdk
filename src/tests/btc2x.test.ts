import { getTokenByChainAndSymbol } from '@indexcoop/tokenlists'
import {
  getMainnetTestFactory,
  getMainnetTestFactoryUniswap,
  getSignerAccount,
  getTestRpcProvider,
  QuoteTokens,
  wei,
} from './utils'

import type { TestFactory } from './utils'

describe('BTC2X (mainnet)', () => {
  const chainId = 1
  const btc2x = getTokenByChainAndSymbol(chainId, 'BTC2X')
  const { eth } = QuoteTokens

  let factory: TestFactory
  const provider = getTestRpcProvider(chainId)
  const signer = getSignerAccount(4, provider)
  beforeEach(async () => {
    factory = getMainnetTestFactory(signer)
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

  test.skip('can mint with ETH (IndexSwapQuoteProvider)', async () => {
    const factory = getMainnetTestFactoryUniswap(signer)
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
