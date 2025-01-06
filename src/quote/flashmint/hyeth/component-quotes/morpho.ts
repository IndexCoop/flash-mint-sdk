/* eslint-disable  @typescript-eslint/no-non-null-assertion */
import type { BigNumber } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'

import { WETH } from 'constants/tokens'
import type { SwapQuoteProvider } from 'quote/swap'
import { isSameAddress } from 'utils/addresses'
import { getRpcProvider } from 'utils/rpc-provider'

export class MorphoQuoteProvider {
  readonly weth = WETH.address!
  constructor(
    private readonly rpcUrl: string,
    private readonly swapQuoteProvider: SwapQuoteProvider,
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
  ): Promise<bigint | null> {
    const tokenContract = this.getTokenContract(component)
    const ethAmount: BigNumber = await tokenContract.previewMint(position)
    if (isSameAddress(inputToken, this.weth)) return ethAmount.toBigInt()
    const quote = await this.swapQuoteProvider.getSwapQuote({
      chainId: 1,
      inputToken,
      outputToken: this.weth,
      outputAmount: ethAmount.toString(),
    })
    if (!quote) return null
    return BigInt(quote.inputAmount)
  }

  async getRedeemQuote(
    component: string,
    position: bigint,
    outputToken: string,
  ): Promise<bigint | null> {
    const tokenContract = this.getTokenContract(component)
    const ethAmount: BigNumber = await tokenContract.previewRedeem(position)
    if (isSameAddress(outputToken, this.weth)) return ethAmount.toBigInt()
    const quote = await this.swapQuoteProvider.getSwapQuote({
      chainId: 1,
      inputToken: this.weth,
      outputToken,
      inputAmount: ethAmount.toString(),
    })
    if (!quote) return null
    return BigInt(quote.outputAmount)
  }
}
