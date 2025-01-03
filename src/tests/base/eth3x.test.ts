import { getTokenByChainAndSymbol } from '@indexcoop/tokenlists'
import { ChainId } from 'constants/chains'
import {
  getBaseTestFactory,
  getSignerAccount,
  getTestRpcProvider,
  QuoteTokens,
  TestFactory,
  wei,
} from 'tests/utils'

describe('ETH3X (Base)', () => {
  const chainId = ChainId.Base
  const { eth } = QuoteTokens
  const eth3x = getTokenByChainAndSymbol(chainId, 'ETH3X')
  let factory: TestFactory
  beforeEach(async () => {
    const signer = getSignerAccount(2, getTestRpcProvider(chainId))
    factory = getBaseTestFactory(signer)
  })

  test('can mint with ETH', async () => {
    await factory.fetchQuote({
      isMinting: true,
      inputToken: eth,
      outputToken: eth3x,
      indexTokenAmount: wei('1').toString(),
      slippage: 0.5,
    })
    await factory.executeTx()
  })

  test('can redeem with ETH', async () => {
    await factory.fetchQuote({
      isMinting: false,
      inputToken: eth3x,
      outputToken: eth,
      indexTokenAmount: wei('1').toString(),
      slippage: 0.5,
    })
    await factory.executeTx()
  })
})
