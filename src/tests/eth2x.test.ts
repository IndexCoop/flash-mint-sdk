import { getTokenByChainAndSymbol } from '@indexcoop/tokenlists'
import {
  QuoteTokens,
  type TestFactory,
  getTestFactoryZeroEx,
  wei,
} from './utils'

describe('ETH2X (mainnet)', () => {
  const chainId = 1
  const { eth } = QuoteTokens
  const eth2x = getTokenByChainAndSymbol(chainId, 'ETH2X')
  let factory: TestFactory
  beforeEach(async () => {
    factory = getTestFactoryZeroEx(4)
  })

  test.only('can mint with ETH', async () => {
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
