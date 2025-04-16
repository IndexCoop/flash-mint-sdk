import { BigNumber } from '@ethersproject/bignumber'
import { getTokenByChainAndSymbol } from '@indexcoop/tokenlists'

import { ChainId } from 'constants/chains'
import { ZeroExV2SwapQuoteProvider } from 'quote/swap'

import { getSellAmount } from './utils'

const chainId = ChainId.Base

const usdcAddress = getTokenByChainAndSymbol(chainId, 'USDC').address
const wethAddress = getTokenByChainAndSymbol(chainId, 'WETH').address

describe('getSellAmount', () => {
  beforeEach((): void => {
    jest.setTimeout(10000000)
  })

  const sellToken = usdcAddress
  const buyToken = wethAddress
  const targetBuyAmount = BigNumber.from(10).pow(18)
  const minBuyAmount = targetBuyAmount.mul(999).div(1000)
  const maxBuyAmount = targetBuyAmount.mul(1001).div(1000)
  const startSellAmount = BigNumber.from(1632 * 10 ** 6)
  const swapQuoteProvider = new ZeroExV2SwapQuoteProvider(
    process.env.ZEROEX_API_KEY!,
  )

  test('returns non null when maxSellAmount is large enough', async () => {
    const maxSellAmount = BigNumber.from(4000 * 10 ** 6)
    const sellAmount = await getSellAmount(
      chainId,
      sellToken,
      buyToken,
      targetBuyAmount,
      minBuyAmount,
      maxBuyAmount,
      startSellAmount,
      maxSellAmount,
      swapQuoteProvider,
    )

    console.log('sellAmount', sellAmount.toString())
    expect(sellAmount.gt(BigNumber.from(1000 * 10 ** 6))).toBe(true)
    expect(sellAmount.lte(maxSellAmount)).toBe(true)
  })

  test('returns null when maxSellAmount is too low', async () => {
    const startSellAmount = BigNumber.from(900 * 10 ** 6)
    const maxSellAmount = BigNumber.from(1000 * 10 ** 6)
    const sellAmount = await getSellAmount(
      chainId,
      sellToken,
      buyToken,
      targetBuyAmount,
      minBuyAmount,
      maxBuyAmount,
      startSellAmount,
      maxSellAmount,
      swapQuoteProvider,
    )
    console.log('sellAmount', sellAmount)

    expect(sellAmount == null).toBe(true)
  })
})
