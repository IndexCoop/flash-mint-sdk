import axios, { AxiosRequestHeaders } from 'axios'

import { ChainId } from 'constants/chains'
import {
  SwapQuote,
  SwapQuoteProvider,
  SwapQuoteRequest,
} from 'quote/swap/interfaces'
import { Exchange } from 'utils'

import { get0xEchangeKey, getSwapData } from './swap-data'

type ZeroExApiSwapRequest = {
  buyAmount?: string
  buyToken: string
  includedSources?: string
  sellAmount?: string
  sellToken: string
  // 0xAPI expects percentage as value between 0-1 e.g. 5% -> 0.05
  slippagePercentage?: string
}

type ZeroExApiSwapResponseOrder = {
  source: string
  fillData: {
    path?: string
    pool?: {
      tokens: string[]
      poolAddress: string
    }
    tokenAddressPath?: string[]
  }
}

type ZeroExApiSwapResponseOrderBalancer = {
  source: string
  fillData: {
    assets: string[]
    chainId: number
    swapSteps: {
      poolId: string
    }[]
    vault: string
  }
}

type ZeroExApiSwapResponseOrderSushi = {
  source: string
  makerToken: string
  takerToken: string
  makerAmount: string
  takerAmount: string
  fillData: {
    tokenAddressPath: string[]
    router: string
  }
  fill: {
    input: string
    output: string
    adjustedOutput: string
    gas: number
  }
}

type ZeroExApiSwapResponse = {
  buyAmount: string
  buyTokenAddress: string
  data: string
  orders?:
    | ZeroExApiSwapResponseOrder[]
    | ZeroExApiSwapResponseOrderBalancer[]
    | ZeroExApiSwapResponseOrderSushi[]
  sellAmount: string
  sellTokenAddress: string
}

export class ZeroExSwapQuoteProvider implements SwapQuoteProvider {
  /**
   * @param baseUrl              The base url (default: https://api.0x.org, watch rate limits)
   * @param affiliateAddress    (Optional) Affiliate address
   * @param headersOverride      (Optional) Override for headers
   * @param swapPathOverride     (Optional) Override of the API path - in case your using a custom path format e.g. through a proxy
   */
  constructor(
    private readonly baseUrl: string | null = null,
    private readonly affiliateAddress: string | null = null,
    private readonly headersOverride: AxiosRequestHeaders | null = null,
    private readonly swapPathOverride: string | null = null
  ) {}

  /**
   * Builds the 0x API URL.
   * @param path     An API path in the form of /swap/v1/quote
   * @param query    A query constructed with URLSearchParams
   * @param chainId  ID of the network
   */
  public buildUrl(path: string, query: string, chainId: number): string {
    const baseUrl = this.getBaseUrl(chainId)
    let url = `${baseUrl}${path}?${query}`
    if (this.affiliateAddress) {
      url += `&affiliateAddress=${this.affiliateAddress}`
    }
    return url
  }

  /**
   * Get a swap quote as described in:
   * https://0x.org/docs/0x-swap-api/api-references/get-swap-v1-quote
   *
   * @param request An instance of type SwapQuoteRequest
   */
  public async getSwapQuote(
    request: SwapQuoteRequest
  ): Promise<SwapQuote | null> {
    const { chainId, inputToken, outputToken, slippage } = request
    const params = this.getParams(request)
    const path = this.swapPathOverride ?? '/swap/v1/quote'
    const query = new URLSearchParams(params).toString()
    let config = {}
    if (this.headersOverride) {
      config = {
        headers: this.headersOverride,
      }
    }
    const url = this.buildUrl(path, query, chainId)
    try {
      const response = await axios.get(url, config)
      const res: ZeroExApiSwapResponse = response.data
      const swapData = await getSwapData(res)
      return {
        chainId,
        inputToken,
        outputToken,
        inputAmount: res.sellAmount,
        outputAmount: res.buyAmount,
        callData: res.data,
        slippage: slippage ?? 0,
        swapData,
      }
    } catch (err: unknown) {
      return null
    }
  }

  private getBaseUrl(chainId: number) {
    if (this.baseUrl === null) {
      return this.getDefaultBaseUrl(chainId)
    }
    return this.baseUrl
  }

  private getDefaultBaseUrl(chainId: number) {
    switch (chainId) {
      case ChainId.Arbitrum:
        return 'https://arbitrum.api.0x.org/'
      case ChainId.Polygon:
        return 'https://polygon.api.0x.org'
      case ChainId.Optimism:
        return 'https://optimism.api.0x.org'
      default:
        return 'https://api.0x.org'
    }
  }

  // Returns a comma separated string of sources to be included for 0x API calls
  private getIncludedSources(sources: Exchange[]): string {
    let includedSources: string[] = []
    if (sources.includes(Exchange.Curve)) {
      includedSources.push(get0xEchangeKey(Exchange.Curve))
    }
    if (sources.includes(Exchange.Quickswap)) {
      includedSources.push(get0xEchangeKey(Exchange.Quickswap))
    }
    if (sources.includes(Exchange.Sushiswap)) {
      includedSources.push(get0xEchangeKey(Exchange.Sushiswap))
    }
    if (sources.includes(Exchange.UniV3)) {
      includedSources.push(get0xEchangeKey(Exchange.UniV3))
    }
    return includedSources.toString()
  }

  private getParams(request: SwapQuoteRequest): ZeroExApiSwapRequest {
    const slippage = request.slippage ? request.slippage : 0.5
    const slippagePercentage = (slippage / 100).toString()
    // Params must be all string because URLSearchParams requires string only
    const params: ZeroExApiSwapRequest = {
      buyToken: request.outputToken,
      sellToken: request.inputToken,
      slippagePercentage,
    }

    if (request.inputAmount) {
      params.sellAmount = request.inputAmount
    } else {
      params.buyAmount = request.outputAmount
    }

    if (request.sources) {
      params.includedSources = this.getIncludedSources(request.sources)
    }

    return params
  }
}
