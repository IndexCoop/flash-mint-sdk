import axios, { type AxiosRequestHeaders } from 'axios'

import { ChainId } from 'constants/chains'

export type ZeroExApiSwapRequest = {
  buyAmount?: string
  buyToken: string
  sellAmount?: string
  sellToken: string
  // 0xAPI expects percentage as value between 0-1 e.g. 5% -> 0.05
  slippagePercentage?: number
}

export type ZeroExApiSwapResponseOrder = {
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
export type ZeroExApiSwapResponseOrderAerodrome = {
  type: number
  source: string
  makerToken: string
  takerToken: string
  makerAmount: string
  takerAmount: string
  fillData: {
    router: string
    routes: [
      {
        from: string
        to: string
        stable: boolean
        factory: string
      },
    ]
  }
  fill: {
    input: string
    output: string
    adjustedOutput: string
    gas: number
  }
}

export type ZeroExApiSwapResponseOrderBalancer = {
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

export type ZeroExApiSwapResponseOrderSushi = {
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

export type ZeroExApiSwapResponse = {
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

export class ZeroExApi {
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
    private readonly swapPathOverride: string | null = null,
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
   * https://docs.0x.org/0x-api-swap/api-references/get-swap-v1-quote
   * @param params          Parameters for the swap request
   * @param chainId         ID of the network
   */
  /* eslint-disable @typescript-eslint/no-explicit-any */
  public async getSwapQuote(
    params: any,
    chainId: number,
  ): Promise<ZeroExApiSwapResponse | null> {
    /* eslint-enable @typescript-eslint/no-explicit-any */
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
      return res
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
      case ChainId.Base:
        return 'https://base.api.0x.org/'
      case ChainId.Polygon:
        return 'https://polygon.api.0x.org'
      case ChainId.Optimism:
        return 'https://optimism.api.0x.org'
      default:
        return 'https://api.0x.org'
    }
  }
}
