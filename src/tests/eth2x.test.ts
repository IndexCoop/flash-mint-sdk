import { getTokenByChainAndSymbol } from '@indexcoop/tokenlists'
import { ETH } from 'constants/tokens'
import { type TestFactory, getTestFactoryZeroExV2, wei } from './utils'

describe('ETH2X (mainnet)', () => {
  const chainId = 1
  const eth2x = getTokenByChainAndSymbol(chainId, 'ETH2X')
  let factory: TestFactory
  beforeEach(async () => {
    factory = getTestFactoryZeroExV2(4)
  })

  test('can mint with ETH', async () => {
    await factory.fetchQuote({
      chainId,
      isMinting: true,
      inputToken: ETH,
      outputToken: eth2x,
      indexTokenAmount: wei('1').toString(),
      inputTokenAmount: wei('0.1').toString(),
      slippage: 0.5,
    })
    await factory.executeTx()
  })

  test('can redeem with ETH', async () => {
    await factory.fetchQuote({
      chainId,
      isMinting: false,
      inputToken: eth2x,
      outputToken: ETH,
      indexTokenAmount: wei('1').toString(),
      inputTokenAmount: wei('1').toString(),
      slippage: 0.5,
    })
    await factory.executeTx()
  })
})
