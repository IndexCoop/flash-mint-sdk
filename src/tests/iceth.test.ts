import { ETH, InterestCompoundingETHIndex } from 'constants/tokens'
import { FlashMintLeveraged } from 'flashMint/leveraged'
import { getFlashMintLeveragedQuote } from 'quote/leveraged'
import { getFlashMintLeveragedContractForToken } from 'utils/contracts'
import { wei } from 'utils/numbers'

import {
  approveErc20,
  balanceOf,
  LocalhostProvider,
  SignerAccount4,
  transferFromWhale,
  ZeroExApiSwapQuote,
} from './utils'

const setToken = InterestCompoundingETHIndex
const setTokenAddress = setToken.address!
const zeroExApi = ZeroExApiSwapQuote
const provider = LocalhostProvider
const signer = SignerAccount4

describe('icETH (mainnet)', () => {
  const chainId = 1

  beforeEach((): void => {
    jest.setTimeout(10000000)
  })

  test('can mint icETH-ETH', async () => {
    const isMinting = true
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
    const contract = getFlashMintLeveragedContractForToken(
      setToken.symbol,
      signer,
      1
    )

    const maxInputAmount = quote.inputOutputTokenAmount // .mul(10001).div(10000)

    // Estimate gas
    const gasEstimate = await contract.estimateGas.issueExactSetFromETH(
      setToken.address!,
      setTokenAmount,
      quote.swapDataDebtCollateral,
      quote.swapDataPaymentToken,
      { value: maxInputAmount }
    )

    // Mint index
    const flashMint = new FlashMintLeveraged(contract)
    const tx = await flashMint.mintExactSetFromETH(
      setToken.address!,
      setTokenAmount,
      quote.swapDataDebtCollateral,
      quote.swapDataPaymentToken,
      maxInputAmount,
      { gasLimit: gasEstimate }
    )
    if (!tx) fail()
    tx.wait()

    const icEthBalance = await balanceOf(signer, setToken.address!)
    expect(icEthBalance.gte(setTokenAmount)).toEqual(true)
  })

  test('can mint icETH-USDC', async () => {
    const isMinting = true
    const setTokenAmount = wei('1')
    const slippage = 2
    const inputToken = {
      symbol: 'USDC',
      decimals: 6,
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    }

    // USDC whale
    const whale = '0x92F9113121532671dD76eb4905b968954FA53930'
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
    const contract = getFlashMintLeveragedContractForToken(
      setToken.symbol,
      signer,
      1
    )

    const maxInputAmount = quote.inputOutputTokenAmount // .mul(1001).div(1000)

    // Estimate gas
    const gasEstimate = await contract.estimateGas.issueExactSetFromETH(
      setToken.address!,
      setTokenAmount,
      quote.swapDataDebtCollateral,
      quote.swapDataPaymentToken,
      { value: maxInputAmount }
    )

    // Mint index
    const flashMint = new FlashMintLeveraged(contract)
    const tx = await flashMint.mintExactSetFromETH(
      setToken.address!,
      setTokenAmount,
      quote.swapDataDebtCollateral,
      quote.swapDataPaymentToken,
      maxInputAmount,
      { gasLimit: gasEstimate }
    )
    if (!tx) fail()
    tx.wait()

    const icEthBalance = await balanceOf(signer, setToken.address!)
    expect(icEthBalance.gte(setTokenAmount)).toEqual(true)
  })

  test('can redeem ETH', async () => {
    const isMinting = false
    const setTokenAmount = wei('1')
    const slippage = 0.5
    // Get quote
    const quote = await getFlashMintLeveragedQuote(
      { symbol: setToken.symbol, decimals: 18, address: setToken.address! },
      { symbol: ETH.symbol, decimals: 18, address: ETH.address! },
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

    // Add some slippage to make sure this redeems
    const minAmountOutput = quote.inputOutputTokenAmount.mul(1000).div(1005)

    await approveErc20(
      setTokenAddress,
      contract.address,
      minAmountOutput,
      signer
    )

    // Estimate gas
    const gasEstimate = await contract.estimateGas.redeemExactSetForETH(
      setToken.address!,
      setTokenAmount,
      minAmountOutput,
      quote.swapDataDebtCollateral,
      quote.swapDataPaymentToken
    )

    // Get current icETH balance
    const icEthBalanceCurrent = await balanceOf(signer, setTokenAddress)

    // Mint index
    const flashMint = new FlashMintLeveraged(contract)
    const tx = await flashMint.redeemExactSetForETH(
      setToken.address!,
      setTokenAmount,
      minAmountOutput,
      quote.swapDataDebtCollateral,
      quote.swapDataPaymentToken,
      { gasLimit: gasEstimate }
    )
    if (!tx) fail()
    tx.wait()

    const icEthBalanceAfter = await balanceOf(signer, setTokenAddress)
    expect(icEthBalanceAfter.lt(icEthBalanceCurrent)).toEqual(true)
  })
})
