import { BigNumber } from '@ethersproject/bignumber'

import {
  debtCollateralSwapData,
  inputSwapData,
  outputSwapData,
} from 'constants/swapdata'
import {
  BTC2xFlexibleLeverageIndex,
  ETH,
  ETH2xFlexibleLeverageIndex,
  GMIIndex,
  InverseETHFlexibleLeverageIndex,
  InterestCompoundingETHIndex,
  MATIC,
  stETH,
} from 'constants/tokens'
import { LocalhostProvider, ZeroExApiSwapQuote } from 'tests/utils'
import { wei } from 'utils/numbers'
import { Exchange, SwapData } from 'utils/swapData'
import {
  getFlashMintLeveragedQuote,
  getIncludedSources,
  getPaymentTokenAddress,
  getSwapDataAndPaymentTokenAmount,
} from './leveraged'

const zeroExApi = ZeroExApiSwapQuote
const provider = LocalhostProvider

describe('getIncludedSources()', () => {
  test('returns Curve only for icETH', async () => {
    const isIcEth = true
    const includedSources = getIncludedSources(isIcEth)
    expect(includedSources).toBeDefined()
    expect(includedSources).toEqual('Curve')
  })

  test('returns all valid exchanges for any other token', async () => {
    const isIcEth = false
    const includedSources = getIncludedSources(isIcEth)
    expect(includedSources).toBeDefined()
    // These are the only supported exchanges for the FlashMintLeveraged
    expect(includedSources).toEqual('QuickSwap,SushiSwap,Uniswap_V3')
  })
})

describe('getPaymentTokenAddress()', () => {
  test('returns ETH for ETH', async () => {
    const paymentTokenAddress = getPaymentTokenAddress(
      ETH.address!,
      ETH.symbol,
      true,
      1
    )
    const paymentTokenAddress2 = getPaymentTokenAddress(
      ETH.address!,
      ETH.symbol,
      false,
      1
    )
    expect(paymentTokenAddress).toEqual('ETH')
    expect(paymentTokenAddress2).toEqual('ETH')
  })

  test('returns icETH address for issuing icETH', async () => {
    const paymentTokenAddress = getPaymentTokenAddress(
      InterestCompoundingETHIndex.address!,
      InterestCompoundingETHIndex.symbol,
      true,
      1
    )
    expect(paymentTokenAddress).toEqual(InterestCompoundingETHIndex.address)
  })

  test('returns stETH address for redeeming icETH', async () => {
    const paymentTokenAddress = getPaymentTokenAddress(
      InterestCompoundingETHIndex.address!,
      InterestCompoundingETHIndex.symbol,
      false,
      1
    )
    const stETH = '0xae7ab96520de3a18e5e111b5eaab095312d7fe84'
    expect(paymentTokenAddress).toEqual(stETH)
  })

  test('returns WMATIC address for MATIC on polygon', async () => {
    const paymentTokenAddress = getPaymentTokenAddress(
      MATIC.addressPolygon!,
      MATIC.symbol,
      true,
      137
    )
    const WMATIC = '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270'
    expect(paymentTokenAddress).toEqual(WMATIC)
  })

  test('returns token address based on chain id', async () => {
    const paymentToken = GMIIndex
    const paymentTokenAddressEth = getPaymentTokenAddress(
      paymentToken.address!,
      paymentToken.symbol,
      true,
      1
    )
    const paymentTokenAddressPolygon = getPaymentTokenAddress(
      paymentToken.addressPolygon!,
      paymentToken.symbol,
      true,
      137
    )
    expect(paymentTokenAddressEth).toEqual(paymentToken.address)
    expect(paymentTokenAddressPolygon).toEqual(paymentToken.addressPolygon)
  })
})

describe('getFlashMintLeveragedQuote()', () => {
  test('returns static swap data for 🧊ETH - issuing', async () => {
    const setToken = InterestCompoundingETHIndex
    const setTokenAmount = BigNumber.from('100')

    const quote = await getFlashMintLeveragedQuote(
      { symbol: ETH.symbol, decimals: 18, address: ETH.address! },
      { symbol: setToken.symbol, decimals: 18, address: setToken.address! },
      setTokenAmount,
      true,
      0.5,
      zeroExApi,
      provider,
      1
    )
    expect(quote).toBeDefined()
    expect(quote?.setTokenAmount).toEqual(setTokenAmount)
    expect(quote?.swapDataDebtCollateral).toStrictEqual(
      debtCollateralSwapData[setToken.symbol]
    )
  })

  test('returns a quote for BTC2xFLI', async () => {
    const isMinting = true
    const setToken = BTC2xFlexibleLeverageIndex
    const setTokenAmount = wei('1')
    const quote = await getFlashMintLeveragedQuote(
      { symbol: ETH.symbol, decimals: 18, address: ETH.address! },
      { symbol: setToken.symbol, decimals: 18, address: setToken.address! },
      setTokenAmount,
      isMinting,
      0.5,
      zeroExApi,
      provider,
      1
    )
    expect(quote).toBeDefined()
    expect(quote?.inputOutputTokenAmount.gt(0)).toBe(true)
    expect(quote?.setTokenAmount).toEqual(setTokenAmount)
    expect(quote?.swapDataDebtCollateral).toBeDefined()
    expect(quote?.swapDataPaymentToken).toBeDefined()
  })

  test('returns a quote for ETH2xFLI', async () => {
    const isMinting = true
    const setToken = ETH2xFlexibleLeverageIndex
    const setTokenAmount = wei('1')
    const quote = await getFlashMintLeveragedQuote(
      { symbol: ETH.symbol, decimals: 18, address: ETH.address! },
      { symbol: setToken.symbol, decimals: 18, address: setToken.address! },
      setTokenAmount,
      isMinting,
      0.5,
      zeroExApi,
      provider,
      1
    )
    expect(quote).toBeDefined()
    expect(quote?.inputOutputTokenAmount.gt(0)).toBe(true)
    expect(quote?.setTokenAmount).toEqual(setTokenAmount)
    expect(quote?.swapDataDebtCollateral).toBeDefined()
    expect(quote?.swapDataPaymentToken).toBeDefined()
  })
})

describe('getSwapDataAndPaymentTokenAmount()', () => {
  test('returns default swap data when collateral token is payment token - and collateral shortfall as payment token amount when issuing', async () => {
    const defaultSwapData: SwapData = {
      exchange: Exchange.None,
      path: [],
      fees: [],
      pool: '0x0000000000000000000000000000000000000000',
    }
    const collateralShortfall = BigNumber.from(1)

    const { swapDataPaymentToken, paymentTokenAmount } =
      await getSwapDataAndPaymentTokenAmount(
        InverseETHFlexibleLeverageIndex.symbol,
        MATIC.addressPolygon!,
        collateralShortfall,
        BigNumber.from(0),
        MATIC.addressPolygon!,
        true,
        0.5,
        '',
        zeroExApi,
        137
      )
    expect(swapDataPaymentToken).toStrictEqual(defaultSwapData)
    expect(paymentTokenAmount.toString()).toEqual(
      collateralShortfall.toString()
    )
  })

  test('returns default swap data when collateral token is payment token - and left over collateral as payment token amount when redeemig', async () => {
    const defaultSwapData: SwapData = {
      exchange: Exchange.None,
      path: [],
      fees: [],
      pool: '0x0000000000000000000000000000000000000000',
    }
    const leftoverCollateral = BigNumber.from(1)

    const { swapDataPaymentToken, paymentTokenAmount } =
      await getSwapDataAndPaymentTokenAmount(
        InverseETHFlexibleLeverageIndex.symbol,
        MATIC.addressPolygon!,
        BigNumber.from(0),
        leftoverCollateral,
        MATIC.addressPolygon!,
        false,
        0.5,
        '',
        zeroExApi,
        137
      )
    expect(swapDataPaymentToken).toStrictEqual(defaultSwapData)
    expect(paymentTokenAmount.toString()).toStrictEqual(
      leftoverCollateral.toString()
    )
  })

  test('returns static swap data for 🧊ETH - issuing', async () => {
    const swapData: SwapData =
      inputSwapData[InterestCompoundingETHIndex.symbol][ETH.symbol]
    const collateralShortfall = BigNumber.from(1)

    const { swapDataPaymentToken, paymentTokenAmount } =
      await getSwapDataAndPaymentTokenAmount(
        InterestCompoundingETHIndex.symbol,
        ETH.address!,
        collateralShortfall,
        BigNumber.from(0),
        ETH.address!,
        true,
        0.5,
        '',
        zeroExApi,
        1
      )
    expect(swapDataPaymentToken).toStrictEqual(swapData)
    expect(paymentTokenAmount.toString()).toStrictEqual(
      collateralShortfall.toString()
    )
  })

  test('returns static swap data for 🧊ETH - issuing (stETH)', async () => {
    const swapData: SwapData =
      inputSwapData[InterestCompoundingETHIndex.symbol][stETH.symbol]
    const collateralShortfall = BigNumber.from(1)

    const { swapDataPaymentToken, paymentTokenAmount } =
      await getSwapDataAndPaymentTokenAmount(
        InterestCompoundingETHIndex.symbol,
        stETH.address!,
        collateralShortfall,
        BigNumber.from(0),
        stETH.address!,
        true,
        0.5,
        '',
        zeroExApi,
        1
      )
    expect(swapDataPaymentToken).toStrictEqual(swapData)
    expect(paymentTokenAmount.toString()).toStrictEqual(
      collateralShortfall.toString()
    )
  })

  test('returns static swap data for 🧊ETH - redeeming', async () => {
    const swapData: SwapData =
      outputSwapData[InterestCompoundingETHIndex.symbol][ETH.symbol]
    const leftoverCollateral = BigNumber.from(1)

    const { swapDataPaymentToken, paymentTokenAmount } =
      await getSwapDataAndPaymentTokenAmount(
        InterestCompoundingETHIndex.symbol,
        ETH.address!,
        BigNumber.from(0),
        leftoverCollateral,
        ETH.address!,
        false,
        0.5,
        '',
        zeroExApi,
        1
      )
    expect(swapDataPaymentToken).toStrictEqual(swapData)
    expect(paymentTokenAmount.toString()).toStrictEqual(
      leftoverCollateral.toString()
    )
  })
})
