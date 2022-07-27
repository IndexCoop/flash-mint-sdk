import axios from 'axios'

import { ChainId } from '../constants/chains'

export type ZeroExApiSwapRequest = {
  buyAmount?: string
  buyToken: string
  sellAmount?: string
  sellToken: string
  // 0xAPI expects percentage as value between 0-1 e.g. 5% -> 0.05
  slippagePercentage?: number
}

export type ZeroExApiSwapResponse = {
  buyAmount: string
  buyTokenAddress: string
  sellAmount: string
  sellTokenAddress: string
}

export class ZeroExApi {
  private affilliateAddress: string | null
  private baseUrl: string | null
  private swapPathOverride: string | null

  /**
   * @param baseUrl              The base url (default: https://api.0x.org, watch rate limits)
   * @param affilliateAddress    (Optional) Affiliate address
   * @param swapPathOverride     (Optional) Override of the API path - in case your using a custom path format e.g. through a proxy
   */
  constructor(
    baseUrl: string | null = null,
    affilliateAddress: string | null = null,
    swapPathOverride: string | null = null
  ) {
    this.affilliateAddress = affilliateAddress
    this.baseUrl = baseUrl
    this.swapPathOverride = swapPathOverride
  }

  /**
   * Builds the 0x API URL.
   * @param path     An API path in the form of /swap/v1/quote
   * @param query    A query constructed with URLSearchParams
   * @param chainId  ID of the network
   */
  public buildUrl(path: string, query: string, chainId: number): string {
    const baseUrl = this.getBaseUrl(chainId)
    let url = `${baseUrl}${path}?${query}`
    if (this.affilliateAddress) {
      url += `&affilliateAddress=${this.affilliateAddress}`
    }
    return url
  }

  /**
   * Get a swap quote as described in:
   * https://docs.0x.org/0x-api-swap/api-references/get-swap-v1-quote
   * @param params          Parameters for the swap request
   * @param chainId         ID of the network
   */
  public async getSwapQuote(params: any, chainId: number): Promise<any | null> {
    const path = this.swapPathOverride ?? '/swap/v1/quote'
    const query = new URLSearchParams(params).toString()
    const url = this.buildUrl(path, query, chainId)
    try {
      const response = await axios.get(url)
      const res: ZeroExApiSwapResponse = response.data
      return res
    } catch (err: any) {
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
      case ChainId.Polygon:
        return 'https://polygon.api.0x.org'
      case ChainId.Optimism:
        return 'https://optimism.api.0x.org'
      default:
        return 'https://api.0x.org'
    }
  }
}
