import axios from 'axios'

import { convertToLiFiSlippage } from 'quote/swap/adapters/lifi/utils'

import type { LiFiStep } from '@lifi/sdk'

interface LiFiQuoteRequest {
  fromChain: number
  fromToken: string
  fromAddress: string
  fromAmount?: string
  toChain: number
  toToken: string
  toAmount?: string
  integrator: string
  slippage: number
}

export async function getQuote(request: LiFiQuoteRequest, apiKey: string) {
  const { fromToken, fromAddress, integrator, slippage, toToken } = request

  const params = new URLSearchParams({
    fromChain: request.fromChain.toString(),
    fromToken,
    fromAddress,
    toChain: request.toChain.toString(),
    toToken,
    integrator,
    slippage: convertToLiFiSlippage(slippage).toString(),
  })

  if (request.fromAmount) {
    params.append('fromAmount', request.fromAmount)
  }

  if (request.toAmount) {
    params.append('toAmount', request.toAmount)
  }

  const config = {
    headers: {
      'x-lifi-api-key': apiKey,
    },
  }

  const path = request.toAmount ? '/toAmount' : ''
  const url = `https://li.quest/v1/quote${path}?${params.toString()}`
  const res = await axios.get(url, config)

  return res.data as LiFiStep
}
