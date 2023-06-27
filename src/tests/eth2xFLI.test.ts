import { BigNumber } from '@ethersproject/bignumber'

import { LeveragedTransactionBuilder } from 'flashmint/builders'
import { LeveragedQuoteProvider } from 'quote/leveraged'
import { wei } from 'utils/numbers'

import {
  createERC20Contract,
  LocalhostProvider,
  QuoteTokens,
  SignerAccount1,
  ZeroExApiSwapQuote,
} from './utils'

const provider = LocalhostProvider
const zeroExApi = ZeroExApiSwapQuote

const { eth, eth2xfli } = QuoteTokens

describe('ETH2xFLI (mainnet)', () => {
  beforeEach((): void => {
    jest.setTimeout(10000000)
  })

  test('can mint ETH2xFLI', async () => {
    const signer = SignerAccount1
    const isMinting = true
    const indexTokenAmount = wei('1')
    const slippage = 1
    // Get quote
    const quoteProvider = new LeveragedQuoteProvider(provider, zeroExApi)
    const quote = await quoteProvider.getQuote({
      inputToken: eth,
      outputToken: eth2xfli,
      indexTokenAmount,
      isMinting,
      slippage,
    })
    if (!quote) fail()
    expect(quote).toBeDefined()
    expect(quote.inputOutputTokenAmount.gt(0)).toBe(true)
    expect(quote.indexTokenAmount).toEqual(indexTokenAmount)
    expect(quote.swapDataDebtCollateral).toBeDefined()
    expect(quote.swapDataPaymentToken).toBeDefined()

    const erc20OutputToken = createERC20Contract(eth2xfli.address, signer)
    const balanceBefore: BigNumber = await erc20OutputToken.balanceOf(
      signer.address
    )

    const builder = new LeveragedTransactionBuilder(provider)
    const tx = await builder.build({
      isMinting,
      indexToken: eth2xfli.address,
      indexTokenSymbol: eth2xfli.symbol,
      inputOutputToken: eth.address,
      inputOutputTokenSymbol: eth.symbol,
      indexTokenAmount,
      inputOutputTokenAmount: quote.inputOutputTokenAmount,
      swapDataDebtCollateral: quote.swapDataDebtCollateral,
      swapDataPaymentToken: quote.swapDataPaymentToken,
    })
    if (!tx) fail()
    const gasEstimate = await provider.estimateGas(tx)
    tx.gasLimit = gasEstimate
    const res = await signer.sendTransaction(tx)
    res.wait()
    const balanceAfter: BigNumber = await erc20OutputToken.balanceOf(
      signer.address
    )
    expect(balanceAfter.gte(balanceBefore.add(indexTokenAmount))).toBe(true)
  })
})
