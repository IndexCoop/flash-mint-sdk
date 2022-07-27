import 'dotenv/config'
import { BigNumber } from '@ethersproject/bignumber'
import { JsonRpcProvider } from '@ethersproject/providers'

import { GMIIndex, MetaverseIndex } from 'constants/tokens'
import { ZeroExApi } from 'utils/0x'
import { wei } from 'utils/numbers'
import { getFlashMintZeroExQuote, getRequiredComponents } from './zeroEx'

const index0xApiBaseUrl = process.env.INDEX_0X_API
const provider = new JsonRpcProvider(process.env.MAINNET_ALCHEMY_API, 1)

describe('getFlashMintZeroExQuote()', () => {
  test('returns a quote for minting', async () => {
    const isMinting = true
    const setToken = '0x72e364F2ABdC788b7E918bc238B21f109Cd634D7'
    const setTokenSymbol = MetaverseIndex.symbol
    const setTokenAmount = wei('1')
    const inputToken = {
      address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      decimals: 18,
      symbol: 'ETH',
    }
    const outputToken = {
      address: setToken,
      decimals: 18,
      symbol: setTokenSymbol,
    }
    const chainId = 1
    const zeroExApi = new ZeroExApi(
      index0xApiBaseUrl,
      '',
      '/mainnet/swap/v1/quote'
    )

    const quote = await getFlashMintZeroExQuote(
      inputToken,
      outputToken,
      setTokenAmount,
      isMinting,
      0.5,
      zeroExApi,
      provider,
      chainId
    )
    expect(quote).toBeDefined()
    expect(quote?.componentQuotes.length).toBeGreaterThan(0)
    expect(quote?.inputOutputTokenAmount).toBeDefined()
    expect(quote?.inputOutputTokenAmount).not.toBe(BigNumber.from(0))
    expect(quote?.setTokenAmount).toEqual(setTokenAmount)
  })

  test('returns a quote for redeeming', async () => {
    const isMinting = false
    const setToken = '0x1494CA1F11D487c2bBe4543E90080AeBa4BA3C2b'
    const setTokenSymbol = MetaverseIndex.symbol
    const setTokenAmount = wei(1)
    const inputToken = {
      address: setToken,
      decimals: 18,
      symbol: setTokenSymbol,
    }
    const outputToken = {
      address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      decimals: 18,
      symbol: 'ETH',
    }
    const chainId = 1
    const zeroExApi = new ZeroExApi(
      index0xApiBaseUrl,
      '',
      '/mainnet/swap/v1/quote'
    )

    const quote = await getFlashMintZeroExQuote(
      inputToken,
      outputToken,
      setTokenAmount,
      isMinting,
      0.5,
      zeroExApi,
      provider,
      chainId
    )
    expect(quote).toBeDefined()
    expect(quote?.componentQuotes.length).toBeGreaterThan(0)
    expect(quote?.inputOutputTokenAmount).toBeDefined()
    expect(quote?.inputOutputTokenAmount).not.toBe(BigNumber.from(0))
    expect(quote?.setTokenAmount).toEqual(setTokenAmount)
  })

  test('returns null if WETH address is undefined', async () => {
    const isMinting = true
    const setToken = '0x47110d43175f7f2C2425E7d15792acC5817EB44f'
    const setTokenSymbol = GMIIndex.symbol
    const setTokenAmount = wei(1)
    const inputToken = {
      address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      decimals: 18,
      symbol: 'ETH',
    }
    const outputToken = {
      address: setToken,
      decimals: 18,
      symbol: setTokenSymbol,
    }
    const chainId = 100
    const zeroExApi = new ZeroExApi(index0xApiBaseUrl)

    const quote = await getFlashMintZeroExQuote(
      inputToken,
      outputToken,
      setTokenAmount,
      isMinting,
      0.5,
      zeroExApi,
      provider,
      chainId
    )
    expect(quote).toBeNull()
  })
})

describe('getRequiredComponents()', () => {
  test('returns components and positions for minting', async () => {
    const isMinting = true
    const setToken = '0x47110d43175f7f2C2425E7d15792acC5817EB44f'
    const setTokenSymbol = GMIIndex.symbol
    const setTokenAmount = BigNumber.from(1)
    const chainId = 1

    const { positions, components } = await getRequiredComponents(
      isMinting,
      setToken,
      setTokenSymbol,
      setTokenAmount,
      provider,
      chainId
    )

    expect(positions.length).toBeGreaterThan(0)
    expect(components.length).toBeGreaterThan(0)
    expect(positions.length).toEqual(components.length)
  })

  test('returns components and positions for redeeming', async () => {
    const isMinting = false
    const setToken = '0x47110d43175f7f2C2425E7d15792acC5817EB44f'
    const setTokenSymbol = GMIIndex.symbol
    const setTokenAmount = BigNumber.from(1)
    const chainId = 1

    const { positions, components } = await getRequiredComponents(
      isMinting,
      setToken,
      setTokenSymbol,
      setTokenAmount,
      provider,
      chainId
    )

    expect(positions.length).toBeGreaterThan(0)
    expect(components.length).toBeGreaterThan(0)
    expect(positions.length).toEqual(components.length)
  })
})
