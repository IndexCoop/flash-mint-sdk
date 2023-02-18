import { BigNumber } from '@ethersproject/bignumber'

import { BTC2xFlexibleLeverageIndex, ETH, USDC } from 'constants/tokens'
import { FlashMintLeveraged } from 'flashMint/leveraged'
import { getFlashMintLeveragedQuote } from 'quote/leveraged'
import { getFlashMintLeveragedContractForToken } from 'utils/contracts'
import { wei } from 'utils/numbers'

import {
  approveErc20,
  createERC20Contract,
  LocalhostProvider,
  SignerAccount2,
  ZeroExApiSwapQuote,
} from './utils'

const setToken = BTC2xFlexibleLeverageIndex
const setTokenAddress = setToken.address!
const zeroExApi = ZeroExApiSwapQuote
const provider = LocalhostProvider

describe('BTC2xFLI (mainnet)', () => {
  const chainId = 1

  beforeEach((): void => {
    jest.setTimeout(10000000)
  })

  test('can mint BTC2xFLI', async () => {
    const signer = SignerAccount2
    const isMinting = true
    const setTokenAmount = wei('2')
    const slippage = 1
    // Get quote
    const quote = await getFlashMintLeveragedQuote(
      { symbol: ETH.symbol, decimals: 18, address: ETH.address! },
      { symbol: setToken.symbol, decimals: 18, address: setTokenAddress },
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

    // Estimate gas
    const gasEstimate = await contract.estimateGas.issueExactSetFromETH(
      setToken.address!,
      setTokenAmount,
      quote.swapDataDebtCollateral,
      quote.swapDataPaymentToken,
      { value: quote.inputOutputTokenAmount }
    )

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
    if (!tx) fail()
    tx.wait()
    const erc20OutputToken = createERC20Contract(setTokenAddress, signer)
    const balanceOutputToken: BigNumber = await erc20OutputToken.balanceOf(
      signer.address
    )
    console.log(balanceOutputToken.toString())
    expect(balanceOutputToken.eq(wei(2))).toEqual(true)
  })

  test('can redeem BTC2xFLI', async () => {
    const signer = SignerAccount2
    const isMinting = false
    const setTokenAmount = wei('1')
    const slippage = 1
    // Get quote
    const quote = await getFlashMintLeveragedQuote(
      { symbol: setToken.symbol, decimals: 18, address: setTokenAddress },
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

    await approveErc20(
      setTokenAddress,
      contract.address,
      setTokenAmount,
      signer
    )

    // Estimate gas
    const gasEstimate = await contract.estimateGas.redeemExactSetForETH(
      setTokenAddress,
      setTokenAmount,
      quote.inputOutputTokenAmount,
      quote.swapDataDebtCollateral,
      quote.swapDataPaymentToken
    )

    // Redeem index
    const flashMint = new FlashMintLeveraged(contract)
    const tx = await flashMint.redeemExactSetForETH(
      setTokenAddress,
      setTokenAmount,
      quote.inputOutputTokenAmount,
      quote.swapDataDebtCollateral,
      quote.swapDataPaymentToken,
      { gasLimit: gasEstimate }
    )
    if (!tx) fail()
    tx.wait()
    const erc20OutputToken = createERC20Contract(setTokenAddress, signer)
    const balanceOutputToken: BigNumber = await erc20OutputToken.balanceOf(
      signer.address
    )
    expect(balanceOutputToken.eq(wei(1))).toEqual(true)
  })

  test('can redeem BTC2xFLI for ERC20', async () => {
    const outputTokenAddress = USDC.address!
    const signer = SignerAccount2
    const isMinting = false
    const setTokenAmount = wei('1')
    const slippage = 1
    // Get quote
    const quote = await getFlashMintLeveragedQuote(
      { symbol: setToken.symbol, decimals: 18, address: setTokenAddress },
      { symbol: USDC.symbol, decimals: 18, address: outputTokenAddress },
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

    await approveErc20(
      setTokenAddress,
      contract.address,
      setTokenAmount,
      signer
    )

    // Estimate gas
    const gasEstimate = await contract.estimateGas.redeemExactSetForERC20(
      setTokenAddress,
      setTokenAmount,
      USDC.address!,
      quote.inputOutputTokenAmount,
      quote.swapDataDebtCollateral,
      quote.swapDataPaymentToken
    )

    // Redeem index
    const flashMint = new FlashMintLeveraged(contract)
    const tx = await flashMint.redeemExactSetForERC20(
      setTokenAddress,
      setTokenAmount,
      USDC.address!,
      quote.inputOutputTokenAmount,
      quote.swapDataDebtCollateral,
      quote.swapDataPaymentToken,
      { gasLimit: gasEstimate }
    )
    if (!tx) fail()
    tx.wait()
    const erc20IndexToken = createERC20Contract(setTokenAddress, signer)
    const balanceIndexToken: BigNumber = await erc20IndexToken.balanceOf(
      signer.address
    )
    expect(balanceIndexToken.eq(0)).toEqual(true)

    const erc20OutputToken = createERC20Contract(outputTokenAddress, signer)
    const balanceOutputToken: BigNumber = await erc20OutputToken.balanceOf(
      signer.address
    )
    console.log(balanceOutputToken.toString(), '///')
    expect(balanceOutputToken.gt(0)).toEqual(true)
  })
})
