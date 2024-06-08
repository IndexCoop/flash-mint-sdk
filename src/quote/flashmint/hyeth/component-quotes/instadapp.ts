/* eslint-disable  @typescript-eslint/no-non-null-assertion */
import { BigNumber } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'

import { stETH } from 'constants/tokens'
import { SwapQuoteProvider } from 'quote/swap'
import { getRpcProvider } from 'utils/rpc-provider'

import VAULT_ABI from './Vault.json'

export class InstadappQuoteProvider {
  constructor(
    private readonly rpcUrl: string,
    private readonly swapQuoteProvider: SwapQuoteProvider
  ) {}

  async getMintQuote(
    component: string,
    position: bigint,
    inputToken: string
  ): Promise<bigint | null> {
    const provider = getRpcProvider(this.rpcUrl)
    // https://etherscan.io/address/0xa0d3707c569ff8c87fa923d3823ec5d81c98be78#readProxyContract
    const tokenContract = new Contract(component, VAULT_ABI, provider)
    const stEthAmount: BigNumber = await tokenContract.previewMint(position)
    const quote = await this.swapQuoteProvider.getSwapQuote({
      chainId: 1,
      inputToken,
      outputToken: stETH.address!,
      outputAmount: stEthAmount.toString(),
    })
    if (!quote) return null
    return BigInt(quote.inputAmount)
  }

  async getRedeemQuote(
    component: string,
    position: bigint,
    outputToken: string
  ): Promise<bigint | null> {
    const provider = getRpcProvider(this.rpcUrl)
    // https://etherscan.io/address/0xa0d3707c569ff8c87fa923d3823ec5d81c98be78#readProxyContract
    const tokenContract = new Contract(component, VAULT_ABI, provider)
    const stEthAmount: BigNumber = await tokenContract.previewRedeem(position)
    const quote = await this.swapQuoteProvider.getSwapQuote({
      chainId: 1,
      inputToken: stETH.address!,
      outputToken,
      inputAmount: stEthAmount.toString(),
    })
    if (!quote) return null
    return BigInt(quote.outputAmount)
  }
}
