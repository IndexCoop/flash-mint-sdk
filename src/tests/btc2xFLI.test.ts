import { BigNumber } from '@ethersproject/bignumber'

import { BTC2xFlexibleLeverageIndex, ETH } from 'constants/tokens'
import { FlashMintLeveraged } from 'flashMint/leveraged'
import { getFlashMintLeveragedQuote } from 'quote/leveraged'
import { getFlashMintLeveragedContractForToken } from 'utils/contracts'
import { wei } from 'utils/numbers'

import {
  createERC20Contract,
  TenderlyProvider,
  SignerAccount2,
  ZeroExApiSwapQuote,
} from './utils'

const zeroExApi = ZeroExApiSwapQuote
const provider = TenderlyProvider

describe('BTC2xFLI (mainnet)', () => {
  const chainId = 1

  beforeEach((): void => {
    jest.setTimeout(10000000)
  })

  test('can mint BTC2xFLI', async () => {
    const signer = SignerAccount2
    const isMinting = true
    const setToken = BTC2xFlexibleLeverageIndex
    const setTokenAmount = wei('1')
    const slippage = 1
    // Get quote
    const quote = await getFlashMintLeveragedQuote(
      { symbol: ETH.symbol, decimals: 18, address: ETH.address! },
      { symbol: setToken.symbol, decimals: 18, address: setToken.address! },
      setTokenAmount,
      isMinting,
      slippage,
      zeroExApi,
      provider,
      chainId
    )
    if (!quote) fail()
    expect(quote).toBeDefined()
    expect(quote.inputOutputTokenAmount.gt(0)).toBe(true)
    expect(quote.setTokenAmount).toEqual(setTokenAmount)
    expect(quote.swapDataDebtCollateral).toBeDefined()
    expect(quote.swapDataPaymentToken).toBeDefined()

    // Get correct FlashMintLeveraged contract
    const contract = getFlashMintLeveragedContractForToken(
      setToken.symbol,
      signer,
      1
    )
    console.log(contract.address, 'contract')

    // Estimate gas
    const gasEstimate = await contract.estimateGas.issueExactSetFromETH(
      setToken.address!,
      setTokenAmount,
      quote.swapDataDebtCollateral,
      quote.swapDataPaymentToken,
      { value: quote.inputOutputTokenAmount }
    )
    console.log(gasEstimate.toString(), 'gas')

    // Mint index
    const flashMint = new FlashMintLeveraged(contract)
    const tx = await flashMint.mintExactSetFromETH(
      setToken.address!,
      setTokenAmount,
      quote.swapDataDebtCollateral,
      quote.swapDataPaymentToken,
      quote.inputOutputTokenAmount,
      { gasLimit: gasEstimate }
    )
    console.log(tx)
    if (!tx) fail()
    tx.wait()
    const erc20OutputToken = createERC20Contract(setToken.address!, signer)
    const balanceOutputToken: BigNumber = await erc20OutputToken.balanceOf(
      signer.address
    )
    console.log(balanceOutputToken.toString(), 'new balance')
    expect(balanceOutputToken.gt(0)).toEqual(true)
  })
})
