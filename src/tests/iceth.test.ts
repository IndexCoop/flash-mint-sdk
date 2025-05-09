import { getTokenByChainAndSymbol } from '@indexcoop/tokenlists'
import { ETH } from 'constants/tokens'
import {
  type TestFactory,
  balanceOf,
  getTestFactoryZeroExV2,
  transferFromWhale,
  wei,
} from './utils'

describe('icETH (mainnet)', () => {
  const chainId = 1
  const iceth = getTokenByChainAndSymbol(chainId, 'icETH')
  let factory: TestFactory
  beforeEach(async () => {
    factory = getTestFactoryZeroExV2(4)
    // Since icETH is not mintable any longer, we need to get some icETH from a
    // whale for testing redemptions.
    const whale = '0xa7CDD2c6338352FaA254D3647f5B12E1A8a432Ce'
    await transferFromWhale(
      whale,
      factory.getSigner().address,
      wei(2),
      iceth.address,
    )
    const balance = await balanceOf(factory.getSigner().address, iceth.address)
    expect(balance.gt(0)).toBe(true)
  })

  test('can redeem for ETH', async () => {
    await factory.fetchQuote({
      chainId: 1,
      isMinting: false,
      inputToken: iceth,
      outputToken: ETH,
      indexTokenAmount: wei('1').toString(),
      inputTokenAmount: wei('1').toString(),
      slippage: 0.5,
    })
    await factory.executeTx()
  })

  test('can redeem for stETH', async () => {
    await factory.fetchQuote({
      chainId: 1,
      isMinting: false,
      inputToken: iceth,
      outputToken: getTokenByChainAndSymbol(chainId, 'stETH'),
      indexTokenAmount: wei('1').toString(),
      inputTokenAmount: wei('1').toString(),
      slippage: 0.5,
    })
    await factory.executeTx()
  })

  test.skip('can redeem for USDC', async () => {
    await factory.fetchQuote({
      chainId: 1,
      isMinting: false,
      inputToken: iceth,
      outputToken: getTokenByChainAndSymbol(chainId, 'USDC'),
      indexTokenAmount: wei('1').toString(),
      inputTokenAmount: wei('1').toString(),
      slippage: 0.5,
    })
    await factory.executeTx()
  })
})
