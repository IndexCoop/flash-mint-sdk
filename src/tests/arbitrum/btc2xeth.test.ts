/* eslint-disable  @typescript-eslint/no-non-null-assertion */
import { getTokenByChainAndSymbol } from '@indexcoop/tokenlists'
import { ChainId } from 'constants/chains'
import {
  getArbitrumTestFactory,
  getSignerAccount,
  LocalhostProviderArbitrum,
  QuoteTokens,
  TestFactory,
  wei,
} from 'tests/utils'

describe('BTC2X (Arbitrum)', () => {
  const { eth } = QuoteTokens
  const btc2x = getTokenByChainAndSymbol(ChainId.Arbitrum, 'BTC2xETH')
  let factory: TestFactory
  beforeEach(async () => {
    const provider = LocalhostProviderArbitrum
    const signer = getSignerAccount(3, provider)
    factory = getArbitrumTestFactory(signer)
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

  test('can redeem with ETH', async () => {
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
