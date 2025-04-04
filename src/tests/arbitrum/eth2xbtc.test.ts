import { getTokenByChainAndSymbol } from '@indexcoop/tokenlists'
import { ChainId } from 'constants/chains'
import { ETH } from 'constants/tokens'
import { type TestFactory, getTestFactoryZeroExV2, wei } from 'tests/utils'

describe('ETH2xBTC (Arbitrum)', () => {
  const chainId = ChainId.Arbitrum
  const eth2xBtc = getTokenByChainAndSymbol(chainId, 'ETH2xBTC')
  let factory: TestFactory
  beforeEach(async () => {
    factory = getTestFactoryZeroExV2(3, chainId)
  })

  test('can mint with ETH', async () => {
    await factory.fetchQuote({
      chainId,
      isMinting: true,
      inputToken: ETH,
      outputToken: eth2xBtc,
      indexTokenAmount: wei('1').toString(),
      inputTokenAmount: wei('1').toString(),
      slippage: 0.5,
    })
    await factory.executeTx()
  })

  test('can redeem with ETH', async () => {
    await factory.fetchQuote({
      chainId,
      isMinting: false,
      inputToken: eth2xBtc,
      outputToken: ETH,
      indexTokenAmount: wei('1').toString(),
      inputTokenAmount: wei('1').toString(),
      slippage: 0.5,
    })
    await factory.executeTx()
  })
})
