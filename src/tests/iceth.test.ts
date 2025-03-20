import { BigNumber } from '@ethersproject/bignumber'
import { getTokenByChainAndSymbol } from '@indexcoop/tokenlists'

import {
  QuoteTokens,
  type TestFactory,
  balanceOf,
  getTestFactoryZeroExV2,
  transferFromWhale,
  wei,
} from './utils'

describe('icETH (mainnet)', () => {
  const chainId = 1
  const { eth } = QuoteTokens
  const iceth = getTokenByChainAndSymbol(chainId, 'icETH')
  const weth = getTokenByChainAndSymbol(chainId, 'WETH')
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
      factory.getProvider(),
    )
    const balance = await balanceOf(factory.getSigner(), iceth.address)
    console.log(balance.toString())
    expect(balance.gt(0)).toBe(true)
  })

  test('can redeem for ETH', async () => {
    await factory.fetchQuote({
      isMinting: false,
      inputToken: iceth,
      outputToken: eth,
      indexTokenAmount: wei('1').toString(),
      inputTokenAmount: wei('1').toString(),
      slippage: 0.5,
    })
    await factory.executeTx(BigNumber.from(5_000_000))
  })

  test('can redeem for WETH', async () => {
    await factory.fetchQuote({
      isMinting: false,
      inputToken: iceth,
      outputToken: weth,
      indexTokenAmount: wei('0.1').toString(),
      inputTokenAmount: wei('0.1').toString(),
      slippage: 0.5,
    })
    await factory.executeTx()
  })
})
