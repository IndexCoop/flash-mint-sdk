import { getTokenByChainAndSymbol } from '@indexcoop/tokenlists'
import { ChainId } from 'constants/chains'
import { ETH } from 'constants/tokens'
import { type TestFactory, getTestFactoryZeroExV2, wei } from 'tests/utils'

describe('BTC2xETH (Arbitrum)', () => {
  const chainId = ChainId.Arbitrum
  const btc2xEth = getTokenByChainAndSymbol(chainId, 'BTC2xETH')
  let factory: TestFactory
  beforeEach(async () => {
    factory = getTestFactoryZeroExV2(3, chainId)
  })

  test('can mint with ETH', async () => {
    await factory.fetchQuote({
      isMinting: true,
      inputToken: ETH,
      outputToken: btc2xEth,
      indexTokenAmount: wei('1').toString(),
      inputTokenAmount: wei('1').toString(),
      slippage: 0.5,
    })
    await factory.executeTx()
  })

  test('can redeem with ETH', async () => {
    await factory.fetchQuote({
      isMinting: false,
      inputToken: btc2xEth,
      outputToken: ETH,
      indexTokenAmount: wei('1').toString(),
      inputTokenAmount: wei('1').toString(),
      slippage: 0.5,
    })
    await factory.executeTx()
  })
})
