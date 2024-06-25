import {
  ContractCallsQuoteRequest,
  getContractCallsQuote,
  getQuote,
  LiFiStep,
} from '@lifi/sdk'

import {
  SwapQuote,
  SwapQuoteProvider,
  SwapQuoteRequest,
} from 'quote/swap/interfaces'

import { getSwapData } from './swap-data'

export class LiFiSwapQuoteProvider implements SwapQuoteProvider {
  constructor(readonly apiKey: string, readonly integrator: string) {}

  async getSwapQuote(request: SwapQuoteRequest): Promise<SwapQuote | null> {
    // This is not ideal but right now the only way to get only uniV2 and sushi quotes
    const allowExchanges = ['uniswap', 'sushiswap']
    const { integrator } = this
    const {
      address,
      chainId,
      inputAmount,
      inputToken,
      outputAmount,
      outputToken,
      slippage,
    } = request
    if (!address) {
      throw new Error('Error - account address must be set')
    }
    if (!inputAmount && !outputAmount) {
      throw new Error('Error - either input or output amount must be set')
    }
    try {
      let result: LiFiStep | null = null
      if (outputAmount) {
        // https://github.com/lifinance/sdk/blob/main/src/services/api.ts#L140
        const quoteRequest: ContractCallsQuoteRequest = {
          integrator,
          contractCalls: [],
          fromAddress: address,
          fromChain: chainId,
          fromToken: inputToken,
          toAmount: outputAmount ?? '',
          toChain: chainId,
          toToken: outputToken,
          allowExchanges,
        }
        result = await getContractCallsQuote(quoteRequest, undefined)
      } else {
        // https://github.com/lifinance/sdk/blob/main/src/services/api.ts#L68
        const quoteRequest = {
          integrator,
          fromAddress: address,
          fromChain: chainId,
          fromToken: inputToken,
          fromAmount: inputAmount ?? '',
          toChain: chainId,
          toToken: outputToken,
          allowExchanges,
        }
        result = await getQuote(quoteRequest)
      }
      if (!result) {
        throw new Error('no estimate')
      }
      const estimate = result.estimate
      const swapData = getSwapData(result)
      return {
        chainId,
        inputToken,
        outputToken,
        inputAmount: estimate.fromAmount,
        outputAmount: estimate.toAmount,
        callData: result.transactionRequest?.data ?? '0x',
        slippage: slippage ?? 0,
        swapData,
      }
    } catch (error) {
      console.log('Error getting LiFi swap quote:')
      console.log(error)
      return null
    }
  }
}
