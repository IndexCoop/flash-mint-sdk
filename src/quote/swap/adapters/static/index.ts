import { getTokenByChainAndSymbol, isAddressEqual } from '@indexcoop/tokenlists'
import { base } from 'viem/chains'

import { AddressZero, EthAddress } from 'constants/addresses'
import { Exchange } from 'utils'

import type {
  SwapQuoteProviderV2,
  SwapQuoteRequestV2,
  SwapQuoteV2,
} from 'quote/swap/interfaces'
import type { SwapDataV5 } from 'utils'
import type { Address } from 'viem'

const uSol = getTokenByChainAndSymbol(base.id, 'uSOL')
const uSui = getTokenByChainAndSymbol(base.id, 'uSUI')
const wstEth = getTokenByChainAndSymbol(base.id, 'wstETH')

export class StaticSwapQuoteProvider implements SwapQuoteProviderV2 {
  async getSwapQuote(request: SwapQuoteRequestV2): Promise<SwapQuoteV2 | null> {
    const { chainId, inputAmount, slippage } = request

    const inputToken = this.getTokenAddressOrWeth(request.inputToken, chainId)
    const outputToken = this.getTokenAddressOrWeth(request.outputToken, chainId)

    if (chainId !== base.id) {
      console.warn('Unsupported chainId. Base only for now.')
      return null
    }

    let swapData: SwapDataV5 = {
      exchange: Exchange.AerodromeSlipstream,
      path: [inputToken, outputToken],
      fees: [],
      pool: AddressZero,
      poolIds: [],
      tickSpacing: [100],
    }

    const isUSol =
      isAddressEqual(inputToken, uSol.address) ||
      isAddressEqual(outputToken, uSol.address)

    if (isUSol) {
      swapData = getUSolSwapData(inputToken, outputToken)
    }

    const isUSui =
      isAddressEqual(inputToken, uSui.address) ||
      isAddressEqual(outputToken, uSui.address)

    if (isUSui) {
      swapData = getUSuiSwapData(inputToken, outputToken)
    }

    const isWstEth =
      isAddressEqual(inputToken, wstEth.address) ||
      isAddressEqual(outputToken, wstEth.address)

    if (isWstEth) {
      swapData = getWstEthSwapData(inputToken, outputToken)
    }

    return {
      chainId,
      inputToken: request.inputToken,
      outputToken: request.outputToken,
      callData: '0x', // not used for leverage tokens
      inputAmount,
      outputAmount: '0', // not used for this swap quote provider
      slippage,
      swapData,
    }
  }

  getTokenAddressOrWeth(token: string, chainId: number): Address {
    return token === EthAddress
      ? getTokenByChainAndSymbol(chainId, 'WETH')!.address
      : (token as Address)
  }
}

function getUSolSwapData(
  inputToken: Address,
  outputToken: Address,
): SwapDataV5 {
  const weth = getTokenByChainAndSymbol(base.id, 'WETH').address
  if (isAddressEqual(inputToken, weth) || isAddressEqual(outputToken, weth)) {
    // WETH/uSOL https://basescan.org/address/0x0225Ba893D5f8Ecd6d2022f9dEC59b34F61098A1
    return {
      exchange: Exchange.AerodromeSlipstream,
      path: [inputToken, outputToken],
      fees: [],
      pool: AddressZero,
      poolIds: [],
      tickSpacing: [200],
    }
  }
  // USDC/WETH WETH/uSOL
  const isRedeeming = isAddressEqual(inputToken, uSol.address)
  return {
    exchange: Exchange.AerodromeSlipstream,
    path: [inputToken, weth, outputToken],
    fees: [],
    pool: AddressZero,
    poolIds: [],
    tickSpacing: isRedeeming ? [200, 100] : [100, 200],
  }
}

function getUSuiSwapData(
  inputToken: Address,
  outputToken: Address,
): SwapDataV5 {
  const weth = getTokenByChainAndSymbol(base.id, 'WETH').address
  if (isAddressEqual(inputToken, weth) || isAddressEqual(outputToken, weth)) {
    // WETH/uSUI https://basescan.org/address/0x5C45b0F48c326f79b56709d8F63CE2beE7697106
    return {
      exchange: Exchange.AerodromeSlipstream,
      path: [inputToken, outputToken],
      fees: [],
      pool: AddressZero,
      poolIds: [],
      tickSpacing: [200],
    }
  }
  // USDC/WETH WETH/uSUI
  const isRedeeming = isAddressEqual(inputToken, uSui.address)
  return {
    exchange: Exchange.AerodromeSlipstream,
    path: [inputToken, weth, outputToken],
    fees: [],
    pool: AddressZero,
    poolIds: [],
    tickSpacing: isRedeeming ? [200, 100] : [100, 200],
  }
}

function getWstEthSwapData(
  inputToken: Address,
  outputToken: Address,
): SwapDataV5 {
  const weth = getTokenByChainAndSymbol(base.id, 'WETH').address
  if (isAddressEqual(inputToken, weth) || isAddressEqual(outputToken, weth)) {
    // WETH/wstETH https://basescan.org/address/0x861A2922bE165a5Bd41b1E482B49216b465e1B5F
    return {
      exchange: Exchange.AerodromeSlipstream,
      path: [inputToken, outputToken],
      fees: [],
      pool: AddressZero,
      poolIds: [],
      tickSpacing: [1],
    }
  }
  // USDC/WETH WETH/wstETH
  const isRedeeming = isAddressEqual(inputToken, wstEth.address)
  return {
    exchange: Exchange.AerodromeSlipstream,
    path: [inputToken, weth, outputToken],
    fees: [],
    pool: AddressZero,
    poolIds: [],
    tickSpacing: isRedeeming ? [1, 100] : [100, 1],
  }
}
