/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ETH, stETH, USDC } from 'constants/tokens'
import { AlchemyProviderUrl } from 'tests/utils'

import { CurveSwapQuoteProvider } from './'
import { Exchange } from 'utils'

const rpcUrl = AlchemyProviderUrl

const eth = ETH.address!
const steth = stETH.address!
const usdc = USDC.address!
const ONE = '1000000000000000000'

describe('CurveSwapQuoteProvider', () => {
  test('getting a swap quote for a specified output amount', async () => {
    const request = {
      chainId: 1,
      inputToken: eth,
      outputToken: steth,
      outputAmount: ONE,
    }
    const provider = new CurveSwapQuoteProvider(rpcUrl)
    const quote = await provider.getSwapQuote(request)
    if (!quote) fail()
    expect(quote).not.toBeNull()
    expect(quote.swapData?.exchange).toBe(Exchange.UniV3)
    expect(quote.swapData?.path.length).toBe(2)
    expect(quote.swapData?.fees.length).toBe(1)
    expect(quote.swapData?.path).toEqual([
      request.inputToken,
      request.outputToken,
    ])
    // expect(quote.callData).not.toBe('0x')
    expect(BigInt(quote.inputAmount) > BigInt(0)).toBe(true)
  })
})
