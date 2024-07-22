import { getTokenData, getTokenDataByAddress } from '@indexcoop/tokenlists'
import { Token, TradeType } from '@uniswap/sdk-core'
import {
  AlphaRouter,
  CurrencyAmount,
  SwapRoute,
} from '@uniswap/smart-order-router'

import { AddressZero, EthAddress } from 'constants/addresses'
import {
  SwapQuote,
  SwapQuoteProvider,
  SwapQuoteRequest,
} from 'quote/swap/interfaces'
import { getRpcProvider } from 'utils/rpc-provider'
import { Exchange, isSameAddress } from 'utils'

function changeToWethIfNecessary(token: string, chainId: number): string {
  if (isSameAddress(token, EthAddress)) {
    const weth = getTokenData('WETH', chainId)
    return weth?.address ?? token
  }
  return token
}

export class UniswapSwapQuoteProvider implements SwapQuoteProvider {
  constructor(readonly rpcUrl: string) {}

  async getSwapQuote(request: SwapQuoteRequest): Promise<SwapQuote | null> {
    const { chainId, inputAmount, outputAmount, slippage } = request

    const inputToken = changeToWethIfNecessary(request.inputToken, chainId)
    const outputToken = changeToWethIfNecessary(request.outputToken, chainId)

    if (
      isSameAddress(inputToken, EthAddress) ||
      isSameAddress(outputToken, EthAddress)
    ) {
      // FIXME: remove for production, just for runnint tests and catching any of these cases
      throw new Error('Error - using ETH instead of WETH')
    }

    if (!inputAmount && !outputAmount) {
      throw new Error('Error - either input or output amount must be set')
    }

    const weth = getTokenData('WETH', chainId)
    const inputTokenData = getTokenDataByAddress(inputToken, chainId)
    const outputTokenData = getTokenDataByAddress(outputToken, chainId)

    if (!inputTokenData || !outputTokenData || !weth) {
      throw new Error('Error - either input or output token is invalid')
    }

    try {
      const isExactOutput = outputAmount !== undefined

      const inputTokenCurrency = new Token(
        chainId,
        inputToken,
        inputTokenData.decimals
      )
      const outputTokenCurrency = new Token(
        chainId,
        outputToken,
        outputTokenData.decimals
      )

      const router = new AlphaRouter({
        chainId,
        provider: getRpcProvider(this.rpcUrl),
      })

      let swapRoute: SwapRoute | null = null
      if (isExactOutput) {
        swapRoute = await router.route(
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          CurrencyAmount.fromRawAmount(outputTokenCurrency, outputAmount!),
          inputTokenCurrency,
          TradeType.EXACT_OUTPUT
        )
      } else {
        swapRoute = await router.route(
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          CurrencyAmount.fromRawAmount(inputTokenCurrency, inputAmount!),
          outputTokenCurrency,
          TradeType.EXACT_INPUT
        )
      }

      if (!swapRoute) return null

      const trade = swapRoute.trade
      if (!trade) return null

      const swap = trade.swaps[0]
      const quotedAmount = isExactOutput
        ? swap.inputAmount.quotient.toString()
        : swap.outputAmount.quotient.toString()

      const route = swap.route
      const path: string[] = route.path.map((token) => token.address)

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
        callData: '0x', // TOOD:
        slippage: slippage ?? 0,
        swapData: {
          exchange,
          path,
          fees,
          pool,
        },
      }
    } catch (error) {
      console.log('Error getting Uniswap swap quote:')
      console.log(error)
      return null
    }
  }
}
