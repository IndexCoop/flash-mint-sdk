import { getTokenByChainAndSymbol } from '@indexcoop/tokenlists'
import { ChainId } from 'constants/chains'
import {
  getTestFactoryZeroEx,
  QuoteTokens,
  type TestFactory,
  wei,
} from 'tests/utils'

const chainId = ChainId.Arbitrum
const btc3x = getTokenByChainAndSymbol(chainId, 'BTC3X')
const { eth } = QuoteTokens

describe.skip('BTC3X (Arbitrum)', () => {
  let factory: TestFactory
  beforeEach(async () => {
    factory = getTestFactoryZeroEx(5, chainId)
  })

  test('can mint with ETH', async () => {
    await factory.fetchQuote({
      isMinting: true,
      inputToken: eth,
      outputToken: btc3x,
      indexTokenAmount: wei('1').toString(),
      slippage: 1,
    })
    await factory.executeTx()
  })

  test('can redeem with ETH', async () => {
    await factory.fetchQuote({
      isMinting: false,
      inputToken: btc3x,
      outputToken: eth,
      indexTokenAmount: wei('1').toString(),
      slippage: 1,
    })
    await factory.executeTx()
  })
})
