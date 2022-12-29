import 'dotenv/config'
import { BigNumber } from '@ethersproject/bignumber'

import { MetaverseIndex, WETH } from 'constants/tokens'
import { ZeroExApi } from 'utils/0x'
import { wei } from 'utils/numbers'
import { LocalhostProvider } from 'utils/_test-utils'

import { getFlashMintZeroExQuote } from '.'

const index0xApiBaseUrl = process.env.INDEX_0X_API

describe('FlashMintZeroEx - Quotes for dsETH', () => {
  const chainId = 1
  const zeroExApi = new ZeroExApi(
    index0xApiBaseUrl,
    '',
    { 'X-INDEXCOOP-API-KEY': process.env.INDEX_0X_API_KEY! },
    '/mainnet/swap/v1/quote'
  )

  beforeEach((): void => {
    jest.setTimeout(1000000)
  })

  test('returns a quote for minting', async () => {
    const isMinting = true
    // const setToken = '0x683Bad7EB64cE3Ec13eCeC3bc7583FCBCB75A9F7'
    // const setTokenSymbol = 'dsETH'
    // FIXME:
    const setToken = '0x72e364F2ABdC788b7E918bc238B21f109Cd634D7'
    const setTokenSymbol = MetaverseIndex.symbol
    const setTokenAmount = wei('1')
    const inputToken = {
      address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      decimals: 18,
      symbol: 'ETH',
    }
    const outputToken = {
      address: setToken,
      decimals: 18,
      symbol: setTokenSymbol,
    }
    const quote = await getFlashMintZeroExQuote(
      inputToken,
      outputToken,
      setTokenAmount,
      isMinting,
      0.5,
      zeroExApi,
      LocalhostProvider,
      chainId
    )
    expect(quote).toBeDefined()
    expect(quote?.componentQuotes.length).toBeGreaterThan(0)
    expect(quote?.inputOutputTokenAmount).toBeDefined()
    expect(quote?.inputOutputTokenAmount).not.toBe(BigNumber.from(0))
    expect(quote?.setTokenAmount).toEqual(setTokenAmount)
  })
})
