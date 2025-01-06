import { getTokenByChainAndSymbol } from '@indexcoop/tokenlists'
import { ChainId } from 'constants/chains'
import {
  QuoteTokens,
  type TestFactory,
  getArbitrumTestFactory,
  getSignerAccount,
  getTestRpcProvider,
  wei,
} from 'tests/utils'

const chainId = ChainId.Arbitrum
const ieth1x = getTokenByChainAndSymbol(chainId, 'iETH1X')
const { eth } = QuoteTokens

describe('iETH1X (Arbitrum)', () => {
  let factory: TestFactory
  beforeEach(async () => {
    const signer = getSignerAccount(1, getTestRpcProvider(chainId))
    factory = getArbitrumTestFactory(signer)
  })

  test('can mint with ETH', async () => {
    await factory.fetchQuote({
      isMinting: true,
      inputToken: eth,
      outputToken: ieth1x,
      indexTokenAmount: wei('1').toString(),
      slippage: 0.5,
    })
    await factory.executeTx()
  })

  test('can redeem with ETH', async () => {
    await factory.fetchQuote({
      isMinting: false,
      inputToken: ieth1x,
      outputToken: eth,
      indexTokenAmount: wei('1').toString(),
      slippage: 0.5,
    })
    await factory.executeTx()
  })
})
