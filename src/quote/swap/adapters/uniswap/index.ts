import {
  getTokenByChainAndAddress,
  getTokenByChainAndSymbol,
} from '@indexcoop/tokenlists'
import type { Token } from '@uniswap/sdk-core'
import axios from 'axios'

import { AddressZero, EthAddress } from 'constants/addresses'
import type {
  SwapQuote,
  SwapQuoteProvider,
  SwapQuoteRequest,
} from 'quote/swap/interfaces'
import { Exchange, isSameAddress } from 'utils'

function changeToWethIfNecessary(token: string, chainId: number): string {
  if (isSameAddress(token, EthAddress)) {
    const weth = getTokenByChainAndSymbol(chainId, 'WETH')
    return weth?.address ?? token
  }
  return token
}

export class UniswapSwapQuoteProvider implements SwapQuoteProvider {
  constructor(readonly endpointUrl: string) {}

  async getSwapQuote(request: SwapQuoteRequest): Promise<SwapQuote | null> {
    const { chainId, inputAmount, outputAmount, slippage } = request

    const inputToken = changeToWethIfNecessary(request.inputToken, chainId)
    const outputToken = changeToWethIfNecessary(request.outputToken, chainId)

    if (isSameAddress(inputToken, outputToken)) {
      return null
    }

    if (
      isSameAddress(inputToken, EthAddress) ||
      isSameAddress(outputToken, EthAddress)
    ) {
      // FIXME: remove for production, just for running tests and catching any of these cases
      throw new Error('Error - using ETH instead of WETH')
    }

    if (!inputAmount && !outputAmount) {
      throw new Error('Error - either input or output amount must be set')
    }

    const weth = getTokenByChainAndSymbol(chainId, 'WETH')
    const inputTokenData = getTokenByChainAndAddress(chainId, inputToken)
    const outputTokenData = getTokenByChainAndAddress(chainId, outputToken)

    if (!inputTokenData || !outputTokenData || !weth) {
      throw new Error('Error - either input or output token is invalid')
    }

    try {
      const isExactOutput = outputAmount !== undefined

      const data = {
        chainId,
        inputToken: inputTokenData.address,
        inputTokenDecimals: inputTokenData.decimals,
        outputToken: outputTokenData.address,
        outputTokenDecimals: outputTokenData.decimals,
        inputAmount,
        outputAmount,
      }
      const url = 'https://app.indexcoop.com/quote/uniswap'
      const response = await axios.post(url, data, {})
      console.log(response.status, response.data)
      const swapRoute = response.data.route

      if (!swapRoute) return null

      const trade = swapRoute.trade
      if (!trade) return null

      const swap = trade.swaps[0]
      const quotedAmount = isExactOutput
        ? swap.inputAmount.quotient.toString()
        : swap.outputAmount.quotient.toString()

      const route = swap.route
      const path: string[] = route.path.map((token: Token) => token.address)

      const isV3 = route.protocol === 'V3'
      let fees: number[] = []
      if (isV3) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        fees = route.pools.map((pool: any) => pool.fee)
      } else {
        fees = route.pools.map(() => 3000)
      }

      // FlashMint contracts use the Quickswap type for UniV2
      const exchange = isV3 ? Exchange.UniV3 : Exchange.Quickswap

      // For UniV3 swap data the contract only needs the path and the fees
      const pool = AddressZero

      return {
        chainId,
        inputToken,
        outputToken,
        inputAmount: inputAmount ?? quotedAmount,
        outputAmount: outputAmount ?? quotedAmount,
        callData: '0x',
        slippage: slippage ?? 0,
        swapData: {
          exchange,
          path,
          fees,
          pool,
        },
      }
    } catch (error) {
      console.warn('Error getting Uniswap swap quote:')
      console.log(error)
      return null
    }
  }
}
