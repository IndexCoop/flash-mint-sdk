import { getTokenByChainAndSymbol } from '@indexcoop/tokenlists'
import {
  QuoteTokens,
  type TestFactory,
  getMainnetTestFactory,
  getMainnetTestFactoryUniswap,
  getSignerAccount,
  getTestRpcProvider,
  wei,
} from './utils'

describe('ETH2X (mainnet)', () => {
  const chainId = 1
  const { eth } = QuoteTokens
  const eth2x = getTokenByChainAndSymbol(chainId, 'ETH2X')
  const signer = getSignerAccount(4, getTestRpcProvider(chainId))
  let factory: TestFactory
  beforeEach(async () => {
    factory = getMainnetTestFactory(signer)
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

  test.skip('can mint with ETH (IndexSwapQuoteProvider)', async () => {
    const factory = getMainnetTestFactoryUniswap(signer)
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

  test.skip('can redeem with ETH (IndexSwapQuoteProvider)', async () => {
    const factory = getMainnetTestFactoryUniswap(signer)
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
