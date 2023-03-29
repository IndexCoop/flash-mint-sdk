import { MoneyMarketIndex, USDC, WETH } from 'constants/tokens'
import { QuoteToken } from 'quote/quoteToken'
import { FlashMintQuoteProvider } from 'quote'
import { getFlashMintWrappedContract } from 'utils/contracts'
import { wei } from 'utils/numbers'

import {
  approveErc20,
  balanceOf,
  createERC20Contract,
  LocalhostProvider,
  SignerAccount2,
  wrapETH,
} from './utils'

const indexToken = MoneyMarketIndex
const indexTokenAddress = indexToken.address!

const provider = LocalhostProvider
const signer = SignerAccount2

const mmi: QuoteToken = {
  address: indexToken.address!,
  decimals: 18,
  symbol: indexToken.symbol,
}

const usdc: QuoteToken = {
  address: USDC.address!,
  decimals: 18,
  symbol: USDC.symbol,
}

const weth: QuoteToken = {
  address: WETH.address!,
  decimals: 18,
  symbol: WETH.symbol,
}

describe('MMI (mainnet)', () => {
  beforeEach((): void => {
    jest.setTimeout(10000000)
  })

  // FIXME: run once issues are fixed
  test.skip('can mint MMI from WETH', async () => {
    // Get quote
    const quoteRequest = {
      isMinting: true,
      inputToken: weth,
      outputToken: mmi,
      indexTokenAmount: wei(1),
      slippage: 0.5,
    }
    const quoteProvider = new FlashMintQuoteProvider(provider)
    const quote = await quoteProvider.getQuote(quoteRequest)
    if (!quote) fail()
    expect(quote).toBeDefined()

    await wrapETH(quote.inputOutputAmount, signer)

    const erc20Contract = createERC20Contract(weth.address, signer)
  })

  test.skip('can mint MMI from WETH', async () => {
    // Get quote
    const quoteRequest = {
      isMinting: true,
      inputToken: usdc,
      outputToken: mmi,
      indexTokenAmount: wei(1),
      slippage: 0.5,
    }
    const quoteProvider = new FlashMintQuoteProvider(provider)
    const quote = await quoteProvider.getQuote(quoteRequest)
    if (!quote) fail()
    expect(quote).toBeDefined()

    await wrapETH(quote.inputOutputAmount, signer)

    const erc20Contract = createERC20Contract(weth.address, signer)
  })

  // FIXME: run when we can mint MMI
  test.skip('can redeem MMI for USDC', async () => {
    const indexTokenAmount = wei(1)
    const outputToken = usdc
    // Get quote
    const quoteRequest = {
      isMinting: false,
      inputToken: mmi,
      outputToken,
      indexTokenAmount,
      slippage: 0.5,
    }
    const quoteProvider = new FlashMintQuoteProvider(provider)
    const quote = await quoteProvider.getQuote(quoteRequest)
    if (!quote) fail()
    expect(quote.inputToken).toEqual(mmi)
    expect(quote.indexTokenAmount).toEqual(indexTokenAmount)
    expect(quote.inputOutputAmount.gt(0)).toBe(true)
    expect(quote.slippage).toEqual(quoteRequest.slippage)
    expect(quote.tx).toBeDefined()

    // Approve spending MMI
    const contract = getFlashMintWrappedContract(signer)
    await approveErc20(mmi.address, contract.address, indexTokenAmount, signer)

    // Balance before
    const balanceBefore = await balanceOf(signer, outputToken.address)
    console.log(balanceBefore.toString(), 'balanceBefore')

    const { tx } = quote

    // Estimate gas
    const gasEstimate = await provider.estimateGas(tx)
    tx.gasLimit = gasEstimate

    // Redeem index
    const resp = await signer.sendTransaction(tx)
    if (!resp) fail()
    resp.wait()

    // Balance after
    const balance = await balanceOf(signer, outputToken.address)
    console.log(balance.toString(), 'balance')
    expect(balance.sub(balanceBefore).gt(quote.inputOutputAmount)).toBe(true)
  })
})
