/* eslint-disable  @typescript-eslint/no-non-null-assertion */
import { BigNumber } from '@ethersproject/bignumber'

import { LeveragedTransactionBuilder } from 'flashmint/builders'
import { LeveragedQuoteProvider } from 'quote/leveraged'
import { wei } from 'utils/numbers'

import {
  balanceOf,
  LocalhostProvider,
  QuoteTokens,
  SignerAccount2,
  ZeroExApiSwapQuote,
  createERC20Contract,
  approveErc20
} from './utils'

const slippage = 0.1

const provider = LocalhostProvider
const signer = SignerAccount2
const zeroExApi = ZeroExApiSwapQuote

// FIXME: add tests for all tokens (mint + redeem)
const { eth, icreth, reth, usdc, weth } = QuoteTokens
const indexToken = icreth

const stealTokens = async (token: string, amount: BigNumber, fromWhale: string) => {
  const contract = createERC20Contract(token,provider)
  const balance = await contract.balanceOf(fromWhale)
  if (balance.lt(amount)) { throw (new Error(`Not enough balance to steal ${amount} ${token} from ${fromWhale}`)) }
  await provider.send("hardhat_impersonateAccount",[fromWhale]);
  const impersonatedSigner =  provider.getSigner(fromWhale);
  await contract.connect(impersonatedSigner).transfer(signer.address,amount);
  await provider.send("hardhat_stopImpersonatingAccount",[fromWhale]);
}
describe('icRETH (mainnet)', () => {
  const rethWhale = "0x7d6149aD9A573A6E2Ca6eBf7D4897c1B766841B4"
  let quote: Awaited<ReturnType<typeof LeveragedQuoteProvider.prototype.getQuote>>
  const inputToken = reth
  const isMinting = true
  const indexTokenAmount = wei('1')
  const quoteProvider = new LeveragedQuoteProvider(provider, zeroExApi)
  beforeAll(async () => {
    await stealTokens(inputToken.address, wei(100), rethWhale)

  })
  beforeEach(async () => {
    // Get quote
     quote = await quoteProvider.getQuote({
      inputToken,
      outputToken: indexToken,
      indexTokenAmount,
      isMinting,
      slippage,
    })
  })

    test('can quote icRETH from rETH', async () => {
    if (!quote) throw new Error("No quote provided")
    expect(quote).toBeDefined()
    expect(quote.inputOutputTokenAmount.gt(0)).toBe(true)
    expect(quote.indexTokenAmount).toEqual(indexTokenAmount)
    expect(quote.swapDataDebtCollateral).toBeDefined()
    expect(quote.swapDataPaymentToken).toBeDefined()
    })

    test('can mint icRETH from rETH', async () => {
    const balanceBefore: BigNumber = await balanceOf(signer, indexToken.address)
    const builder = new LeveragedTransactionBuilder(provider)
    if (!quote) throw new Error("No quote provided")
    const tx = await builder.build({
      isMinting,
      indexToken: indexToken.address,
      indexTokenSymbol: indexToken.symbol,
      inputOutputToken: inputToken.address,
      inputOutputTokenSymbol: inputToken.symbol,
      indexTokenAmount,
      inputOutputTokenAmount: quote.inputOutputTokenAmount,
      swapDataDebtCollateral: quote.swapDataDebtCollateral,
      swapDataPaymentToken: quote.swapDataPaymentToken,
    })
    if (!tx || !tx.to) fail()
    await approveErc20(inputToken.address,tx.to,wei(100),signer)
    const gasEstimate = await signer.estimateGas(tx)
    tx.gasLimit = gasEstimate
    const res = await signer.sendTransaction(tx)
    await res.wait()
    const balanceAfter: BigNumber = await balanceOf(signer, indexToken.address)
    expect(balanceAfter.gte(balanceBefore.add(indexTokenAmount))).toBe(true)
  })
})
