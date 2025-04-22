import { getTokenByChainAndSymbol } from '@indexcoop/tokenlists'
import { wei } from 'utils'
import { StaticSwapQuoteProvider } from './'

const taker = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'

describe('StaticSwapQuoteProvider', () => {
  test('getting a quote for minting', async () => {
    const ETH2X = getTokenByChainAndSymbol(1, 'ETH2X')
    const USDC = getTokenByChainAndSymbol(1, 'USDC')
    const request = {
      chainId: 1,
      isMinting: true,
      inputToken: USDC.address,
      outputToken: ETH2X.address,
      indexTokenAmount: wei(1).toBigInt(),
      inputAmount: wei(20, 6).toBigInt(),
      slippage: 0.5,
      taker,
    }
    const provider = new StaticSwapQuoteProvider()
    const quote = await provider.getSwapQuote(request)
    console.log(quote)
  })
})
