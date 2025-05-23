import { getTokenByChainAndSymbol, isAddressEqual } from '@indexcoop/tokenlists'

import { AddressZero, HashZero } from 'constants/addresses'
import { ChainId } from 'constants/chains'
import { Contracts } from 'constants/contracts'
import { ETH } from 'constants/tokens'
import {
  getLifiSwapQuoteProvider,
  getLocalHostProviderUrl,
  getZeroExV2SwapQuoteProvider,
} from 'tests/utils'
import { isZeroExV2AllowanceHolderContract } from 'utils/addresses'
import { wei } from 'utils/numbers'

import {
  type FlashMintLeveragedZeroExQuoteRequest,
  LeveragedZeroExQuoteProvider,
} from './provider'

import type { SwapDataV2 } from 'utils'

const rpcUrlArb = getLocalHostProviderUrl(ChainId.Arbitrum)
const rpcUrlBase = getLocalHostProviderUrl(ChainId.Base)
const swapQuoteOutputProvider = getLifiSwapQuoteProvider()
const swapQuoteProviderZeroExV2 = getZeroExV2SwapQuoteProvider()

const takerArb = Contracts[ChainId.Arbitrum].FlashMintLeveragedZeroEx
const taker = Contracts[ChainId.Base].FlashMintLeveragedZeroEx

async function getArbQuote(request: FlashMintLeveragedZeroExQuoteRequest) {
  const quoteProvider = new LeveragedZeroExQuoteProvider(
    rpcUrlArb,
    swapQuoteProviderZeroExV2,
    swapQuoteOutputProvider,
  )
  const quoteResult = await quoteProvider.getQuote(request)
  expect(quoteResult.success).toBe(true)
  if (!quoteResult.success) fail()
  return quoteResult.data
}

describe.skip('LeveragedZeroExQuoteProvider()', () => {
  const indexToken = getTokenByChainAndSymbol(ChainId.Arbitrum, 'ETH2X')
  const usdc = getTokenByChainAndSymbol(ChainId.Arbitrum, 'USDC')

  test('returns quote for ETH2X - minting w/ ETH', async () => {
    const request = {
      chainId: ChainId.Arbitrum,
      isMinting: true,
      inputToken: ETH,
      outputToken: indexToken,
      inputAmount: wei(0.5).toString(),
      outputAmount: wei(1).toString(),
      slippage: 0.5,
      taker: takerArb,
    }

    const quote = await getArbQuote(request)

    expect(quote.outputAmount).toEqual(request.outputAmount)
    expect(BigInt(quote.inputAmount) > BigInt(0)).toBe(true)

    validateSwapData(quote.swapDataDebtCollateral)
    shouldBeNoOpSwapData(quote.swapDataInputOutputToken)
  })

  test('returns quote for ETH2X - minting w/ ERC20', async () => {
    const request = {
      chainId: ChainId.Arbitrum,
      isMinting: true,
      inputToken: usdc,
      outputToken: indexToken,
      inputAmount: wei(100).toString(),
      outputAmount: wei(1).toString(),
      slippage: 0.5,
      taker: takerArb,
    }

    const quote = await getArbQuote(request)

    expect(quote.outputAmount).toEqual(request.outputAmount)
    expect(BigInt(quote.inputAmount) > BigInt(0)).toBe(true)

    validateSwapData(quote.swapDataDebtCollateral)
    validateSwapData(quote.swapDataInputOutputToken)
  })

  test('returns quote for ETH2X - redeeming to ETH', async () => {
    const request = {
      chainId: ChainId.Arbitrum,
      isMinting: false,
      inputToken: indexToken,
      outputToken: ETH,
      inputAmount: wei(1).toString(),
      outputAmount: wei(1).toString(),
      slippage: 1.0,
      taker: takerArb,
    }

    const quote = await getArbQuote(request)

    expect(quote.inputAmount).toEqual(request.inputAmount)
    expect(BigInt(quote.outputAmount) > BigInt(0)).toBe(true)

    validateSwapData(quote.swapDataDebtCollateral)
    validateSwapData(quote.swapDataInputOutputToken)
  })

  test('returns quote for ETH2X - redeeming to ERC20', async () => {
    const request = {
      chainId: ChainId.Arbitrum,
      isMinting: false,
      inputToken: indexToken,
      outputToken: usdc,
      inputAmount: wei(1).toString(),
      outputAmount: wei(1).toString(),
      slippage: 1.0,
      taker: takerArb,
    }

    const quote = await getArbQuote(request)

    expect(quote.inputAmount).toEqual(request.inputAmount)
    expect(BigInt(quote.outputAmount) > BigInt(0)).toBe(true)

    validateSwapData(quote.swapDataDebtCollateral)
    validateSwapData(quote.swapDataInputOutputToken)
  })
})

async function getQuote(request: FlashMintLeveragedZeroExQuoteRequest) {
  const quoteProvider = new LeveragedZeroExQuoteProvider(
    rpcUrlBase,
    swapQuoteProviderZeroExV2,
    swapQuoteOutputProvider,
  )
  const quoteResult = await quoteProvider.getQuote(request)
  expect(quoteResult.success).toBe(true)
  if (!quoteResult.success) fail()
  return quoteResult.data
}

function validateSwapData(swapData: SwapDataV2) {
  const LifiExchangeProxyContract = '0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE'
  expect(
    isZeroExV2AllowanceHolderContract(swapData.swapTarget) ||
      isAddressEqual(swapData.swapTarget, LifiExchangeProxyContract) ||
      isAddressEqual(swapData.swapTarget, AddressZero),
  ).toBe(true)
  expect(swapData.callData).not.toBeUndefined()
}

function shouldBeNoOpSwapData(swapData: SwapDataV2) {
  expect(swapData.swapTarget).toBe(AddressZero)
  expect(swapData.callData).toBe(HashZero)
}

describe.skip('LeveragedZeroExQuoteProvider() - Base', () => {
  const usdc = getTokenByChainAndSymbol(ChainId.Base, 'USDC')
  const uSOL2x = getTokenByChainAndSymbol(ChainId.Base, 'uSOL2x')

  test('returns quote for uSOL2x - minting w/ ETH', async () => {
    const request = {
      chainId: ChainId.Base,
      isMinting: true,
      inputToken: ETH,
      outputToken: uSOL2x,
      inputAmount: wei(0.2).toString(),
      outputAmount: wei(1).toString(),
      slippage: 0.5,
      taker,
    }

    const quote = await getQuote(request)

    expect(quote.outputAmount).toEqual(request.outputAmount)
    expect(BigInt(quote.inputAmount) > BigInt(0)).toBe(true)

    validateSwapData(quote.swapDataDebtCollateral)
    validateSwapData(quote.swapDataInputOutputToken)
  })

  test('returns quote for uSOL2x - minting w/ ERC20', async () => {
    const request = {
      chainId: ChainId.Base,
      isMinting: true,
      inputToken: usdc,
      outputToken: uSOL2x,
      inputAmount: wei(380, 6).toString(),
      outputAmount: wei(1).toString(),
      slippage: 0.5,
      taker,
    }

    const quote = await getQuote(request)

    expect(quote.outputAmount).toEqual(request.outputAmount)
    expect(BigInt(quote.inputAmount) > BigInt(0)).toBe(true)

    validateSwapData(quote.swapDataDebtCollateral)
    validateSwapData(quote.swapDataInputOutputToken)
  })

  test('returns quote for uSOL2x - redeeming to ETH', async () => {
    const request = {
      chainId: ChainId.Base,
      isMinting: false,
      inputToken: uSOL2x,
      outputToken: ETH,
      inputAmount: wei(1).toString(),
      outputAmount: '',
      slippage: 0.5,
      taker,
    }

    const quote = await getQuote(request)

    expect(quote.inputAmount).toEqual(request.inputAmount)
    expect(BigInt(quote.outputAmount) > BigInt(0)).toBe(true)

    validateSwapData(quote.swapDataDebtCollateral)
    validateSwapData(quote.swapDataInputOutputToken)
  })

  test('returns quote for uSOL2x - redeeming to USDC', async () => {
    const request = {
      chainId: ChainId.Base,
      isMinting: false,
      inputToken: uSOL2x,
      outputToken: usdc,
      inputAmount: wei(1).toString(),
      outputAmount: '0',
      slippage: 0.5,
      taker,
    }

    const quote = await getQuote(request)

    expect(quote.inputAmount).toEqual(request.inputAmount)
    expect(BigInt(quote.outputAmount) > BigInt(0)).toBe(true)

    validateSwapData(quote.swapDataDebtCollateral)
    validateSwapData(quote.swapDataInputOutputToken)
  })
})
