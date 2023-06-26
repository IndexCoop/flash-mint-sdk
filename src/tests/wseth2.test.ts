/* eslint-disable  @typescript-eslint/no-non-null-assertion */
import { BigNumber } from '@ethersproject/bignumber'

import { sETH2, WETH, wsETH2 } from 'constants/tokens'
import { ZeroExTransactionBuilder } from 'flashmint'
import { ZeroExQuoteProvider } from 'quote'
import {
  LocalhostProvider,
  SignerAccount17,
  ZeroExApiSwapQuote,
  approveErc20,
  balanceOf,
  createERC20Contract,
} from 'tests/utils'
import { wei } from 'utils/numbers'

import { swapExactInput } from './utils/uniswap'
import { wrapETH } from './utils'

const zeroExApi = ZeroExApiSwapQuote

describe('FlashMintZeroEx - wsETH2', () => {
  beforeEach((): void => {
    jest.setTimeout(10000000)
  })

  test('wsETH2 minting works using sETH2', async () => {
    const isMinting = true
    const provider = LocalhostProvider
    const signer = SignerAccount17

    const sETH2Address = sETH2.address!
    const ethSETH2PoolAddress = '0x7379e81228514a1D2a6Cf7559203998E20598346'
    const WETH9 = WETH.address!

    const amountIn = wei(2)
    const amountOutMin = wei(1)

    // Wrap ETH for buying some sETH2
    await wrapETH(amountIn, signer)

    // Get some sETH2
    await swapExactInput(
      ethSETH2PoolAddress,
      { amountIn, amountOutMin, tokenIn: WETH9, tokenOut: sETH2Address },
      provider,
      signer
    )

    // Check getting sETH2 worked
    const erc20SETH2 = createERC20Contract(sETH2Address, signer)
    const balanceSETH2: BigNumber = await erc20SETH2.balanceOf(signer.address)
    expect(balanceSETH2.gt(0)).toBe(true)

    // Get FlashMintZeroEx Quote
    const inputToken = {
      address: sETH2.address!,
      decimals: 18,
      symbol: sETH2.symbol,
    }
    const outputToken = {
      address: wsETH2.address!,
      decimals: 18,
      symbol: wsETH2.symbol,
    }
    const indexTokenAmount = wei('1')
    const quoteProvider = new ZeroExQuoteProvider(provider, zeroExApi)
    const quote = await quoteProvider.getQuote({
      inputToken,
      outputToken,
      indexTokenAmount,
      isMinting,
      slippage: 0.5,
    })
    expect(quote).toBeDefined()
    if (!quote) fail()
    expect(quote.componentQuotes.length).toBeGreaterThan(0)
    expect(quote.inputOutputTokenAmount).toBeDefined()
    expect(quote.inputOutputTokenAmount.gt(0)).toBe(true)
    expect(quote.indexTokenAmount).toEqual(indexTokenAmount)

    const builder = new ZeroExTransactionBuilder(provider)
    const tx = await builder.build({
      isMinting,
      indexToken: outputToken.address,
      indexTokenSymbol: outputToken.symbol,
      inputOutputToken: inputToken.address,
      inputOutputTokenSymbol: inputToken.symbol,
      indexTokenAmount,
      inputOutputTokenAmount: quote.inputOutputTokenAmount,
      componentQuotes: quote.componentQuotes,
    })

    if (!tx) fail()

    await approveErc20(
      inputToken.address,
      tx.to!,
      quote.inputOutputTokenAmount,
      signer
    )

    const balanceBefore = await balanceOf(signer, outputToken.address)
    // const gasEstimate = await provider.estimateGas(tx)
    // tx.gasLimit = gasEstimate
    tx.gasLimit = 5_000_000

    const res = await signer.sendTransaction(tx)
    if (!res) fail()
    res.wait()

    const balanceAfter = await balanceOf(signer, outputToken.address)
    expect(balanceAfter.gte(balanceBefore.add(indexTokenAmount))).toEqual(true)
  })
})
