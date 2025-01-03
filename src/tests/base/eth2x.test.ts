import { getTokenByChainAndSymbol } from '@indexcoop/tokenlists'
import { ChainId } from 'constants/chains'
import {
  QuoteTokens,
  type TestFactory,
  getBaseTestFactory,
  getSignerAccount,
  getTestRpcProvider,
  wei,
} from 'tests/utils'

describe('ETH2X (Base)', () => {
  const chainId = ChainId.Base
  const { eth } = QuoteTokens
  const eth2x = getTokenByChainAndSymbol(chainId, 'ETH2X')
  let factory: TestFactory
  beforeEach(async () => {
    const signer = getSignerAccount(0, getTestRpcProvider(chainId))
    factory = getBaseTestFactory(signer)
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
