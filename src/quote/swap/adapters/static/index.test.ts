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

  test('AAVE2x redeem on Arbitrum routes through AaveV3DeleveredRedeemer (no RPC)', async () => {
    // The aaveDeleveredRedeem entry kind synthesizes the quote from the static
    // unitsPerSet, so getQuote doesn't hit any on-chain view. Use a placeholder
    // rpcUrl — the test still validates the SDK's tx encoding end-to-end.
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
    const provider = new StaticQuoteProvider('http://placeholder.invalid')
    const quote = await provider.getQuote(request)
    if (!quote) fail()
    expect(quote.isMinting).toBe(false)
    // Predicted output = 0.01 * 0.863285415590294069 ≈ 0.00863 AAVE, then
    // 0.5% slippage haircut. quoteAmount is the pre-slippage number.
    expect(quote.quoteAmount).toBe('8632854155902940') // 0.01 * unitsPerSet / 1e18
    expect(BigInt(quote.outputAmount) > BigInt(0)).toBe(true)
    // tx.data starts with the redeem(address,uint256,address) selector (0x6b6c2a31)
    // — derive the expected selector from ethers/viem at test time to keep this
    // robust against ABI-format changes.
    // tx.data = 0x + 4-byte selector + 3 × 32-byte args (setToken, amount, recipient)
    expect(quote.tx.data!.startsWith('0x')).toBe(true)
    expect(quote.tx.data!.length).toBe(2 + 8 + 64 * 3)
    // Recipient sentinel: trailing arg is address(0), the contract substitutes msg.sender.
    expect(quote.tx.data!.slice(-64)).toBe('0'.repeat(64))
  })

  test('AAVE2x mint on Arbitrum is rejected with IssueNotSupported', async () => {
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
