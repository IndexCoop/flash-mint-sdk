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
const btc2x = getTokenByChainAndSymbol(chainId, 'BTC2X')
const { eth } = QuoteTokens

describe('BTC2X (Arbitrum)', () => {
  let factory: TestFactory
  beforeEach(async () => {
    const signer = getSignerAccount(3, getTestRpcProvider(chainId))
    factory = getArbitrumTestFactory(signer)
  })

  test('can mint with ETH', async () => {
    await factory.fetchQuote({
      isMinting: true,
      inputToken: eth,
      outputToken: btc2x,
      indexTokenAmount: wei('1').toString(),
      slippage: 0.5,
    })
    await factory.executeTx()
  })

  test('can redeem with ETH', async () => {
    await factory.fetchQuote({
      isMinting: false,
      inputToken: btc2x,
      outputToken: eth,
      indexTokenAmount: wei('1').toString(),
      slippage: 0.5,
    })
    await factory.executeTx()
  })
})
