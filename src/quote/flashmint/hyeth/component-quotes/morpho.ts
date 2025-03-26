import { Contract } from '@ethersproject/contracts'

import { Contracts } from 'constants/contracts'
import { WETH } from 'constants/tokens'
import { getSellAmount } from 'quote/flashmint/leveraged-zeroex/utils'
import { wei } from 'utils'
import { isSameAddress } from 'utils/addresses'
import { getRpcProvider } from 'utils/rpc-provider'

import type { BigNumber } from '@ethersproject/bignumber'
import type { SwapQuoteProviderV2 } from 'quote/swap'

export class MorphoQuoteProvider {
  readonly taker = Contracts[1].FlashMintHyEthV3
  readonly weth = WETH.address!
  constructor(
    private readonly rpcUrl: string,
    private readonly swapQuoteProvider: SwapQuoteProviderV2,
  ) {}

  getTokenContract(address: string): Contract {
    const provider = getRpcProvider(this.rpcUrl)
    const abi = [
      'function previewMint(uint256 shares) public view returns (uint256)',
      'function previewRedeem(uint256 shares) public view returns (uint256)',
    ]
    return new Contract(address, abi, provider)
  }

  async getMintQuote(
    component: string,
    position: bigint,
    inputToken: string,
    slippage: number,
  ): Promise<bigint | null> {
    const { taker } = this
    const tokenContract = this.getTokenContract(component)
    const ethAmount: BigNumber = await tokenContract.previewMint(position)

    if (isSameAddress(inputToken, this.weth)) return ethAmount.toBigInt()

    const targetBuyAmount = ethAmount.mul(1001).div(1000)
    const minBuyAmount = ethAmount
    const maxBuyAmount = ethAmount.mul(1005).div(1000)

    // TODO: determine max sell amount
    const maxSellAmount = wei('3000', 6)

    const sellAmount = await getSellAmount(
      1,
      inputToken,
      this.weth,
      targetBuyAmount,
      minBuyAmount,
      maxBuyAmount,
      maxSellAmount,
    )

    const quote = await this.swapQuoteProvider.getSwapQuote({
      chainId: 1,
      inputToken,
      outputToken: this.weth,
      inputAmount: sellAmount.toString(),
      slippage,
      taker,
    })
    if (!quote) return null
    return BigInt(quote.outputAmount)
  }

  async getRedeemQuote(
    component: string,
    position: bigint,
    outputToken: string,
    slippage: number,
  ): Promise<bigint | null> {
    const { taker } = this
    const tokenContract = this.getTokenContract(component)
    const ethAmount: BigNumber = await tokenContract.previewRedeem(position)
    if (isSameAddress(outputToken, this.weth)) return ethAmount.toBigInt()
    const quote = await this.swapQuoteProvider.getSwapQuote({
      chainId: 1,
      inputToken: this.weth,
      outputToken,
      inputAmount: ethAmount.toString(),
      slippage,
      taker,
    })
    if (!quote) return null
    return BigInt(quote.outputAmount)
  }
}
