import 'dotenv/config'

import { ZeroExApi } from 'utils/0x'

const DPI = '0x1494CA1F11D487c2bBe4543E90080AeBa4BA3C2b'
const ONE = '1000000000000000000'

const header = {
  /* eslint-disable  @typescript-eslint/no-non-null-assertion */
  'X-INDEXCOOP-API-KEY': process.env.INDEX_0X_API_KEY!,
}
const index0xApiBaseUrl = process.env.INDEX_0X_API

describe('ZeroExApi', () => {
  test('building a url', async () => {
    const expectedUrl =
      'https://api.0x.org/swap/v1/quote?buyAmount=1000000000000000000&buyToken=0x1494CA1F11D487c2bBe4543E90080AeBa4BA3C2b&sellToken=ETH'
    const chainId = 1
    const query = new URLSearchParams({
      buyAmount: '1000000000000000000',
      buyToken: '0x1494CA1F11D487c2bBe4543E90080AeBa4BA3C2b',
      sellToken: 'ETH',
    }).toString()
    const zeroExApi = new ZeroExApi(null, null, header)
    const url = zeroExApi.buildUrl('/swap/v1/quote', query, chainId)
    expect(url).toEqual(expectedUrl)
  })

  test('building a url for optimism', async () => {
    const expectedUrl =
      'https://optimism.api.0x.org/swap/v1/quote?buyAmount=1000000000000000000&buyToken=0x1494CA1F11D487c2bBe4543E90080AeBa4BA3C2b&sellToken=ETH'
    const chainId = 10
    const query = new URLSearchParams({
      buyAmount: '1000000000000000000',
      buyToken: '0x1494CA1F11D487c2bBe4543E90080AeBa4BA3C2b',
      sellToken: 'ETH',
    }).toString()
    const zeroExApi = new ZeroExApi(null, null, header)
    const url = zeroExApi.buildUrl('/swap/v1/quote', query, chainId)
    expect(url).toEqual(expectedUrl)
  })

  test('building a url for polygon', async () => {
    const expectedUrl =
      'https://polygon.api.0x.org/swap/v1/quote?buyAmount=1000000000000000000&buyToken=0x1494CA1F11D487c2bBe4543E90080AeBa4BA3C2b&sellToken=ETH'
    const chainId = 137
    const query = new URLSearchParams({
      buyAmount: ONE,
      buyToken: DPI,
      sellToken: 'ETH',
    }).toString()
    const zeroExApi = new ZeroExApi(null, null, header)
    const url = zeroExApi.buildUrl('/swap/v1/quote', query, chainId)
    expect(url).toEqual(expectedUrl)
  })

  test('building a url with a different base url', async () => {
    const expectedUrl =
      'https://api.index.com/swap/v1/quote?buyAmount=1000000000000000000&buyToken=0x1494CA1F11D487c2bBe4543E90080AeBa4BA3C2b&sellToken=ETH'
    const baseUrl = 'https://api.index.com'
    const chainId = 10
    const query = new URLSearchParams({
      buyAmount: ONE,
      buyToken: DPI,
      sellToken: 'ETH',
    }).toString()
    const zeroExApi = new ZeroExApi(baseUrl, null, header)
    const url = zeroExApi.buildUrl('/swap/v1/quote', query, chainId)
    expect(url).toEqual(expectedUrl)
  })

  test('building a url with a different base url and affiliate address', async () => {
    const expectedUrl =
      'https://api.index.com/swap/v1/quote?buyAmount=1000000000000000000&buyToken=0x1494CA1F11D487c2bBe4543E90080AeBa4BA3C2b&sellToken=ETH&affiliateAddress=0xaffiliate'
    const affiliateAddress = '0xaffiliate'
    const baseUrl = 'https://api.index.com'
    const chainId = 10
    const query = new URLSearchParams({
      buyAmount: ONE,
      buyToken: DPI,
      sellToken: 'ETH',
    }).toString()
    const zeroExApi = new ZeroExApi(baseUrl, affiliateAddress, header)
    const url = zeroExApi.buildUrl('/swap/v1/quote', query, chainId)
    expect(url).toEqual(expectedUrl)
  })

  test('getting a swap quote', async () => {
    const chainId = 1
    const params = {
      buyAmount: ONE,
      buyToken: DPI,
      sellToken: 'ETH',
    }
    const zeroExApi = new ZeroExApi(null, null, header)
    const quote = await zeroExApi.getSwapQuote(params, chainId)
    if (!quote) fail()
    expect(quote).not.toBeNull()
    expect(quote.sellAmount).not.toBeNull()
  })

  test('getting a swap quote - when overriding the swap path', async () => {
    const chainId = 1
    const params = {
      buyAmount: ONE,
      buyToken: DPI,
      sellToken: 'ETH',
    }
    const zeroExApi = new ZeroExApi(
      index0xApiBaseUrl,
      '',
      header,
      '/mainnet/swap/v1/quote'
    )
    const quote = await zeroExApi.getSwapQuote(params, chainId)
    if (!quote) fail()
    expect(quote).not.toBeNull()
    expect(quote.sellAmount).not.toBeNull()
  })

  test('getting a swap quote fails for wrong base url', async () => {
    const chainId = 1
    const params = {
      buyAmount: ONE,
      buyToken: DPI,
      sellToken: 'ETH',
    }
    const zeroExApi = new ZeroExApi('https://')
    const quote = await zeroExApi.getSwapQuote(params, chainId)
    expect(quote).toBeNull()
  })
})
