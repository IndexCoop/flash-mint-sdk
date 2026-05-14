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
    if (!quote) fail()
    expect(quote.isMinting).toBe(true)
    expect(BigInt(quote.inputAmount) > BigInt(0)).toBe(true)
    expect(quote.tx.to).toBe('0x45c00508C14601fd1C1e296eB3C0e3eEEdCa45D0')
    expect(quote.tx.data).toBeDefined()
    expect(quote.tx.value === BigInt(quote.inputAmount)).toBe(true)
  })

  test('getting a quote for redeeming', async () => {
    const ETH2X = getTokenByChainAndSymbol(1, 'ETH2X')
    const request = {
      chainId: 1,
      isMinting: false,
      inputToken: ETH2X,
      outputToken: ETH,
      inputAmount: wei(1).toBigInt(),
      outputAmount: wei(1).toBigInt(),
      slippage: 0.5,
      taker,
    }
    const rpcUrl = getAlchemyProviderUrl(request.chainId)
    const provider = new StaticQuoteProvider(rpcUrl)
    const quote = await provider.getQuote(request)
    if (!quote) fail()
    expect(quote.isMinting).toBe(false)
    expect(BigInt(quote.outputAmount) > BigInt(0)).toBe(true)
    expect(quote.tx.to).toBe('0x45c00508C14601fd1C1e296eB3C0e3eEEdCa45D0')
    expect(quote.tx.data).toBeDefined()
  })

  test('AAVE2x redeem on Arbitrum routes through FlashMintAaveDelevered', async () => {
    const AAVE2x = getTokenByChainAndSymbol(42161, 'AAVE2x')
    const AAVE = getTokenByChainAndSymbol(42161, 'AAVE')
    const request = {
      chainId: 42161,
      isMinting: false,
      inputToken: AAVE2x,
      outputToken: AAVE,
      inputAmount: wei(0.01).toBigInt(),
      outputAmount: wei(0.01).toBigInt(),
      slippage: 0.5,
      taker,
    }
    const rpcUrl = getAlchemyProviderUrl(request.chainId)
    const provider = new StaticQuoteProvider(rpcUrl)
    const quote = await provider.getQuote(request)
    if (!quote) fail()
    expect(quote.isMinting).toBe(false)
    expect(quote.tx.to).toBe('0x85eC64C97b6E17e7092cE584a2643C6C824E51FC')
    expect(BigInt(quote.outputAmount) > BigInt(0)).toBe(true)
    expect(quote.tx.data).toBeDefined()
  })

  test('AAVE2x mint on Arbitrum is rejected with IssueNotSupported', async () => {
    // Mint short-circuits before the RPC call, so a placeholder URL is fine.
    const AAVE2x = getTokenByChainAndSymbol(42161, 'AAVE2x')
    const AAVE = getTokenByChainAndSymbol(42161, 'AAVE')
    const request = {
      chainId: 42161,
      isMinting: true,
      inputToken: AAVE,
      outputToken: AAVE2x,
      inputAmount: wei(0.01).toBigInt(),
      outputAmount: wei(0.01).toBigInt(),
      slippage: 0.5,
      taker,
    }
    const provider = new StaticQuoteProvider('http://placeholder.invalid')
    const quote = await provider.getQuote(request)
    expect(quote).toBeNull()
  })

  test('getting a quote for redeeming icETH', async () => {
    const icETH = getTokenByChainAndSymbol(1, 'icETH')
    const request = {
      chainId: 1,
      isMinting: false,
      inputToken: icETH,
      outputToken: ETH,
      inputAmount: wei(1).toBigInt(),
      outputAmount: wei(1).toBigInt(),
      slippage: 0.5,
      taker,
    }
    const rpcUrl = getAlchemyProviderUrl(request.chainId)
    const provider = new StaticQuoteProvider(rpcUrl)
    const quote = await provider.getQuote(request)
    if (!quote) fail()
    console.log(quote)
    expect(quote.isMinting).toBe(false)
    expect(BigInt(quote.outputAmount) > BigInt(0)).toBe(true)
    expect(quote.tx.to).toBe('0x40e8e58052272496dcf42953CF7e699B522Fe8A3')
    expect(quote.tx.data).toBeDefined()
  })
})
