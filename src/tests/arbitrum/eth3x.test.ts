import { getTokenByChainAndSymbol } from '@indexcoop/tokenlists'
import { ChainId } from 'constants/chains'
import { ETH } from 'constants/tokens'
import { type TestFactory, getTestFactoryZeroExV2, wei } from 'tests/utils'

const chainId = ChainId.Arbitrum
const eth3x = getTokenByChainAndSymbol(chainId, 'ETH3X')

describe('ETH3X (Arbitrum)', () => {
  let factory: TestFactory
  beforeEach(async () => {
    factory = getTestFactoryZeroExV2(2, chainId)
  })

  test.only('can mint with ETH', async () => {
    await factory.fetchQuote({
      isMinting: true,
      inputToken: ETH,
      outputToken: eth3x,
      indexTokenAmount: wei('1').toString(),
      inputTokenAmount: wei('1').toString(),
      slippage: 0.5,
    })
    await factory.executeTx()
  })

  test('can redeem with ETH', async () => {
    await factory.fetchQuote({
      isMinting: false,
      inputToken: eth3x,
      outputToken: ETH,
      indexTokenAmount: wei('1').toString(),
      inputTokenAmount: wei('1').toString(),
      slippage: 0.5,
    })
    await factory.executeTx()
  })
})
