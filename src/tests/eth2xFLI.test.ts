import { BigNumber } from '@ethersproject/bignumber'

import { ETH, ETH2xFlexibleLeverageIndex } from 'constants/tokens'
import { FlashMintLeveraged } from 'flashmint/leveraged'
import { getFlashMintLeveragedQuote } from 'quote/leveraged'
import { getFlashMintLeveragedContractForToken } from 'utils/contracts'
import { wei } from 'utils/numbers'

import {
  createERC20Contract,
  LocalhostProvider,
  SignerAccount1,
  ZeroExApiSwapQuote,
} from './utils'

const zeroExApi = ZeroExApiSwapQuote
const provider = LocalhostProvider

describe('ETH2xFLI (mainnet)', () => {
  const chainId = 1

  beforeEach((): void => {
    jest.setTimeout(10000000)
  })

  test('can mint ETH2xFLI', async () => {
    const signer = SignerAccount1
    const isMinting = true
    const setToken = ETH2xFlexibleLeverageIndex
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
    const erc20OutputToken = createERC20Contract(setToken.address!, signer)
    const balanceOutputToken: BigNumber = await erc20OutputToken.balanceOf(
      signer.address
    )
    expect(balanceOutputToken.gt(0)).toEqual(true)
  })
})
