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
const eth2x = getTokenByChainAndSymbol(chainId, 'ETH2X')
const { eth } = QuoteTokens

describe('ETH2X (Arbitrum)', () => {
  let factory: TestFactory
  beforeEach(async () => {
    const signer = getSignerAccount(0, getTestRpcProvider(chainId))
    factory = getArbitrumTestFactory(signer)
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
