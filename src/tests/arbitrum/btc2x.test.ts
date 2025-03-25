import { getTokenByChainAndSymbol } from '@indexcoop/tokenlists'
import { ChainId } from 'constants/chains'
import { ETH } from 'constants/tokens'
import { type TestFactory, getTestFactoryZeroExV2, wei } from 'tests/utils'

const chainId = ChainId.Arbitrum
const btc2x = getTokenByChainAndSymbol(chainId, 'BTC2X')

describe('BTC2X (Arbitrum)', () => {
  let factory: TestFactory
  beforeEach(async () => {
    factory = getTestFactoryZeroExV2(3, chainId)
  })

  test('can mint with ETH', async () => {
    await factory.fetchQuote({
      isMinting: true,
      inputToken: ETH,
      outputToken: btc2x,
      indexTokenAmount: wei('1').toString(),
      inputTokenAmount: wei('1').toString(),
      slippage: 0.5,
    })
    await factory.executeTx()
  })

  test('can redeem with ETH', async () => {
    await factory.fetchQuote({
      isMinting: false,
      inputToken: btc2x,
      outputToken: ETH,
      indexTokenAmount: wei('1').toString(),
      inputTokenAmount: wei('1').toString(),
      slippage: 0.5,
    })
    await factory.executeTx()
  })
})
