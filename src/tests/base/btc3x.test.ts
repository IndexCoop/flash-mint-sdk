import { getTokenByChainAndSymbol } from '@indexcoop/tokenlists'
import { ChainId } from 'constants/chains'
import {
  QuoteTokens,
  type TestFactory,
  getTestFactoryZeroEx,
  wei,
} from 'tests/utils'

describe('BTC3X (Base)', () => {
  const chainId = ChainId.Base
  const { eth } = QuoteTokens
  const indexToken = getTokenByChainAndSymbol(chainId, 'BTC3X')
  let factory: TestFactory
  beforeEach(async () => {
    factory = getTestFactoryZeroEx(0, chainId)
  })

  test('can mint with ETH', async () => {
    await factory.fetchQuote({
      isMinting: true,
      inputToken: eth,
      outputToken: indexToken,
      indexTokenAmount: wei('1').toString(),
      inputTokenAmount: wei(0.5).toString(),
      slippage: 0.5,
    })
    await factory.executeTx()
  })

  test.skip('can redeem with ETH', async () => {
    await factory.fetchQuote({
      isMinting: false,
      inputToken: indexToken,
      outputToken: eth,
      indexTokenAmount: wei('1').toString(),
      inputTokenAmount: wei('1').toString(),
      slippage: 0.5,
    })
    await factory.executeTx()
  })
})
