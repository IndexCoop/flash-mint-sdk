import { getTokenByChainAndSymbol } from '@indexcoop/tokenlists'
import { ChainId } from 'constants/chains'
import {
  QuoteTokens,
  type TestFactory,
  getArbitrumTestFactory,
  getSignerAccount,
  getTestRpcProvider,
  wei,
} from 'tests/utils'

describe('BTC2xETH (Arbitrum)', () => {
  const { eth } = QuoteTokens
  const btc2xEth = getTokenByChainAndSymbol(ChainId.Arbitrum, 'BTC2xETH')
  let factory: TestFactory
  beforeEach(async () => {
    const signer = getSignerAccount(3, getTestRpcProvider(ChainId.Arbitrum))
    factory = getArbitrumTestFactory(signer)
  })

  test('can mint with ETH', async () => {
    await factory.fetchQuote({
      isMinting: true,
      inputToken: eth,
      outputToken: btc2xEth,
      indexTokenAmount: wei('1').toString(),
      slippage: 0.5,
    })
    await factory.executeTx()
  })

  test('can redeem with ETH', async () => {
    await factory.fetchQuote({
      isMinting: false,
      inputToken: btc2xEth,
      outputToken: eth,
      indexTokenAmount: wei('1').toString(),
      slippage: 0.5,
    })
    await factory.executeTx()
  })
})
