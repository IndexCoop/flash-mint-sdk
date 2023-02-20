import { BigNumber } from '@ethersproject/bignumber'

import { ETH, InterestCompoundingETHIndex } from 'constants/tokens'
import { FlashMintLeveraged } from 'flashMint/leveraged'
import { getFlashMintLeveragedQuote } from 'quote/leveraged'
import { getFlashMintLeveragedContractForToken } from 'utils/contracts'
import { wei } from 'utils/numbers'

import {
  balanceOf,
  createERC20Contract,
  LocalhostProvider,
  SignerAccount1,
  transferFromWhale,
  ZeroExApiSwapQuote,
} from './utils'

const zeroExApi = ZeroExApiSwapQuote
const provider = LocalhostProvider

describe('icETH (mainnet)', () => {
  const chainId = 1

  beforeEach((): void => {
    jest.setTimeout(10000000)
  })

  test('can mint icETH-ETH', async () => {
    const signer = SignerAccount1
    const isMinting = true
    const setToken = InterestCompoundingETHIndex
    const setTokenAmount = wei('1')
    const slippage = 0.5
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
    // const contract = getFlashMintLeveragedContractForToken(
    //   setToken.symbol,
    //   signer,
    //   1
    // )

    // // Estimate gas
    // const gasEstimate = await contract.estimateGas.issueExactSetFromETH(
    //   setToken.address!,
    //   setTokenAmount,
    //   quote.swapDataDebtCollateral,
    //   quote.swapDataPaymentToken,
    //   { value: quote.inputOutputTokenAmount }
    // )

    // // Mint index
    // const flashMint = new FlashMintLeveraged(contract)
    // const tx = await flashMint.mintExactSetFromETH(
    //   setToken.address!,
    //   setTokenAmount,
    //   quote.swapDataDebtCollateral,
    //   quote.swapDataPaymentToken,
    //   quote.inputOutputTokenAmount,
    //   { gasLimit: gasEstimate }
    // )
    // if (!tx) fail()
    // tx.wait()

    // const icEthBalance = await balanceOf(signer, setToken.address!)
    // expect(icEthBalance.gte(setTokenAmount)).toEqual(true)
  })

  test('can mint icETH-USDC', async () => {
    const signer = SignerAccount1
    const isMinting = true
    const setToken = InterestCompoundingETHIndex
    const setTokenAmount = wei('1')
    const slippage = 2
    const inputToken = {
      symbol: 'USDC',
      decimals: 6,
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    }

    // USDC whale
    const whale = '0x77f33da6046a03ebb0e6d33a26cb49bd738774ff'
    await transferFromWhale(
      whale,
      signer.address,
      wei('10000', inputToken.decimals),
      inputToken.address,
      provider
    )

    // Get quote
    const quote = await getFlashMintLeveragedQuote(
      inputToken,
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
    // const contract = getFlashMintLeveragedContractForToken(
    //   setToken.symbol,
    //   signer,
    //   1
    // )

    // // Estimate gas
    // const gasEstimate = await contract.estimateGas.issueExactSetFromETH(
    //   setToken.address!,
    //   setTokenAmount,
    //   quote.swapDataDebtCollateral,
    //   quote.swapDataPaymentToken,
    //   { value: quote.inputOutputTokenAmount }
    // )

    // // Mint index
    // const flashMint = new FlashMintLeveraged(contract)
    // const tx = await flashMint.mintExactSetFromETH(
    //   setToken.address!,
    //   setTokenAmount,
    //   quote.swapDataDebtCollateral,
    //   quote.swapDataPaymentToken,
    //   quote.inputOutputTokenAmount,
    //   { gasLimit: gasEstimate }
    // )
    // if (!tx) fail()
    // tx.wait()

    // const icEthBalance = await balanceOf(signer, setToken.address!)
    // expect(icEthBalance.gte(setTokenAmount)).toEqual(true)
  })
})
