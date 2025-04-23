import { getTokenByChainAndSymbol } from '@indexcoop/tokenlists'
import { ETH } from 'constants/tokens'
import { wei } from 'utils'
import { StaticSwapQuoteProvider } from './'

const taker = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'

describe('StaticSwapQuoteProvider', () => {
  test('getting a quote for minting', async () => {
    const ETH2X = getTokenByChainAndSymbol(1, 'ETH2X')
    const request = {
      chainId: 1,
      isMinting: true,
      inputToken: ETH,
      outputToken: ETH2X,
      indexTokenAmount: wei(1).toBigInt(),
      // TODO:
      inputAmount: wei(1).toBigInt(),
      slippage: 0.5,
      taker,
    }
    // fIXME: rpc url
    const provider = new StaticSwapQuoteProvider(
      process.env.MAINNET_ALCHEMY_API!,
    )
    const quote = await provider.getSwapQuote(request)
    console.log(quote)
  })
})
