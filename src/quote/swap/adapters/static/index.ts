import { base } from 'viem/chains'

import { AddressZero, EthAddress } from 'constants/addresses'
import { Exchange } from 'utils'

import { getTokenByChainAndSymbol } from '@indexcoop/tokenlists'
import type {
  SwapQuoteProviderV2,
  SwapQuoteRequestV2,
  SwapQuoteV2,
} from 'quote/swap/interfaces'
import type { SwapDataV4 } from 'utils'
import type { Address } from 'viem'

export class StaticSwapQuoteProvider implements SwapQuoteProviderV2 {
  async getSwapQuote(request: SwapQuoteRequestV2): Promise<SwapQuoteV2 | null> {
    const { chainId, inputAmount, slippage } = request

    const inputToken = this.getTokenAddressOrWeth(request.inputToken, chainId)
    const outputToken = this.getTokenAddressOrWeth(request.outputToken, chainId)

    if (chainId !== base.id) {
      console.warn('Unsupported chainId. Base only for now.')
      return null
    }

    const swapData: SwapDataV4 = {
      exchange: Exchange.AerodromeSlipstream,
      path: [inputToken, outputToken],
      fees: [],
      pool: AddressZero,
      poolIds: [],
      // TODO: check all pools
      tickSpacing: [100],
    }

    return {
      chainId,
      inputToken: request.inputToken,
      outputToken: request.outputToken,
      callData: '0x', // not used for leverage tokens
      inputAmount,
      outputAmount: '0', // not used for this swap quote provider
      slippage,
      swapData,
    }
  }

  getTokenAddressOrWeth(token: string, chainId: number): Address {
    return token === EthAddress
      ? getTokenByChainAndSymbol(chainId, 'WETH')!.address
      : (token as Address)
  }
}
