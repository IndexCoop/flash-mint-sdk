import { getTokenByChainAndSymbol } from '@indexcoop/tokenlists'
import { ChainId } from 'constants/chains'
import {
  QuoteTokens,
  type TestFactory,
  getTestFactoryZeroExV2,
  wei,
} from 'tests/utils'

const chainId = ChainId.Arbitrum
const ibtc1x = getTokenByChainAndSymbol(chainId, 'iBTC1X')
const { eth } = QuoteTokens

describe('iBTC1X (Arbitrum)', () => {
  let factory: TestFactory
  beforeEach(async () => {
    factory = getTestFactoryZeroExV2(4, chainId)
  })

  test('can mint with ETH', async () => {
    await factory.fetchQuote({
      isMinting: true,
      inputToken: eth,
      outputToken: ibtc1x,
      indexTokenAmount: wei('1').toString(),
      inputTokenAmount: wei('1').toString(),
      slippage: 0.5,
    })
    await factory.executeTx()
  })

  test('can redeem with ETH', async () => {
    await factory.fetchQuote({
      isMinting: false,
      inputToken: ibtc1x,
      outputToken: eth,
      indexTokenAmount: wei('1').toString(),
      inputTokenAmount: wei('1').toString(),
      slippage: 0.5,
    })
    await factory.executeTx()
  })
})
