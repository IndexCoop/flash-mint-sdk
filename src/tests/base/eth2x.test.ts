import { getTokenByChainAndSymbol } from '@indexcoop/tokenlists'
import { ChainId } from 'constants/chains'
import {
  QuoteTokens,
  type TestFactory,
  getTestFactoryZeroEx,
  wei,
} from 'tests/utils'

describe('ETH2X (Base)', () => {
  const chainId = ChainId.Base
  const { eth } = QuoteTokens
  const eth2x = getTokenByChainAndSymbol(chainId, 'ETH2X')
  let factory: TestFactory
  beforeEach(async () => {
    factory = getTestFactoryZeroEx(2, chainId)
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

  test.skip('can redeem with ETH', async () => {
    await factory.fetchQuote({
      isMinting: false,
      inputToken: eth2x,
      outputToken: eth,
      indexTokenAmount: wei('1').toString(),
      slippage: 0.6,
    })
    await factory.executeTx()
  })
})
