import { getTokenByChainAndSymbol } from '@indexcoop/tokenlists'
import { ChainId } from 'constants/chains'
import {
  QuoteTokens,
  type TestFactory,
  getTestFactoryZeroExV2,
  wei,
} from 'tests/utils'

describe('ETH2xBTC (Arbitrum)', () => {
  const chainId = ChainId.Arbitrum
  const { eth } = QuoteTokens
  const eth2xBtc = getTokenByChainAndSymbol(chainId, 'ETH2xBTC')
  let factory: TestFactory
  beforeEach(async () => {
    factory = getTestFactoryZeroExV2(3, chainId)
  })

  test('can mint with ETH', async () => {
    await factory.fetchQuote({
      isMinting: true,
      inputToken: eth,
      outputToken: eth2xBtc,
      indexTokenAmount: wei('1').toString(),
      inputTokenAmount: wei('1').toString(),
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
      inputTokenAmount: wei('1').toString(),
      slippage: 0.5,
    })
    await factory.executeTx()
  })
})
