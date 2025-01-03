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

describe('ETH2xBTC (Arbitrum)', () => {
  const { eth } = QuoteTokens
  const eth2xBtc = getTokenByChainAndSymbol(ChainId.Arbitrum, 'ETH2xBTC')
  let factory: TestFactory
  beforeEach(async () => {
    const signer = getSignerAccount(3, getTestRpcProvider(ChainId.Arbitrum))
    factory = getArbitrumTestFactory(signer)
  })

  test('can mint with ETH', async () => {
    await factory.fetchQuote({
      isMinting: true,
      inputToken: eth,
      outputToken: eth2xBtc,
      indexTokenAmount: wei('1').toString(),
      slippage: 0.5,
    })
    await factory.executeTx()
  })

  test('can redeem with ETH', async () => {
    await factory.fetchQuote({
      isMinting: false,
      inputToken: eth2xBtc,
      outputToken: eth,
      indexTokenAmount: wei('1').toString(),
      slippage: 0.5,
    })
    await factory.executeTx()
  })
})
