import { getTokenByChainAndSymbol } from '@indexcoop/tokenlists'
import { ChainId } from 'constants/chains'
import {
  getArbitrumTestFactory,
  getSignerAccount,
  getTestRpcProvider,
  QuoteTokens,
  TestFactory,
  wei,
} from 'tests/utils'

const chainId = ChainId.Arbitrum
const ibtc1x = getTokenByChainAndSymbol(chainId, 'iBTC1X')
const { eth } = QuoteTokens

describe('iBTC1X (Arbitrum)', () => {
  let factory: TestFactory
  beforeEach(async () => {
    const signer = getSignerAccount(4, getTestRpcProvider(chainId))
    factory = getArbitrumTestFactory(signer)
  })

  test('can mint with ETH', async () => {
    await factory.fetchQuote({
      isMinting: true,
      inputToken: eth,
      outputToken: ibtc1x,
      indexTokenAmount: wei('1').toString(),
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
      slippage: 0.5,
    })
    await factory.executeTx()
  })
})
