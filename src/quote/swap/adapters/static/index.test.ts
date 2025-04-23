import { getTokenByChainAndSymbol } from '@indexcoop/tokenlists'
import { ETH } from 'constants/tokens'
import { getAlchemyProviderUrl } from 'tests/utils'
import { wei } from 'utils'
import { StaticQuoteProvider } from './'

const taker = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'

describe('StaticQuoteProvider', () => {
  test('getting a quote for minting', async () => {
    const ETH2X = getTokenByChainAndSymbol(1, 'ETH2X')
    const request = {
      chainId: 1,
      isMinting: true,
      inputToken: ETH,
      outputToken: ETH2X,
      inputAmount: wei(1).toBigInt(),
      outputAmount: wei(1).toBigInt(),
      slippage: 0.5,
      taker,
    }
    const rpcUrl = getAlchemyProviderUrl(request.chainId)
    const provider = new StaticQuoteProvider(rpcUrl)
    const quote = await provider.getQuote(request)
    console.log(quote)
    if (!quote) fail()
    expect(BigInt(quote.inputAmount) > BigInt(0)).toBe(true)
    expect(quote.tx.to).toBe('0x45c00508C14601fd1C1e296eB3C0e3eEEdCa45D0')
    expect(quote.tx.data).toBeDefined()
    expect(quote.tx.value === BigInt(quote.inputAmount)).toBe(true)
  })
})
