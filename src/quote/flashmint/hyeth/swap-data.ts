/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { AddressZero, EthAddress } from 'constants/addresses'
import { noopSwapData } from 'constants/swapdata'
import { ETH, WETH } from 'constants/tokens'
import type { QuoteToken } from 'quote/interfaces'
import { Exchange, type SwapData } from 'utils'

export function getComponentsSwapData(components: string[]): SwapData[] {
  return components.map(() => noopSwapData)
}

export function getEthToInputOutputTokenSwapData(
  inputOutputToken: QuoteToken,
): SwapData | null {
  if (inputOutputToken.symbol === ETH.symbol) return null
  if (inputOutputToken.symbol === WETH.symbol) {
    return {
      path: [EthAddress, inputOutputToken.address],
      fees: [],
      pool: AddressZero,
      exchange: Exchange.None,
    }
  }
  return {
    path: [WETH.address!, inputOutputToken.address],
    fees: [500],
    pool: AddressZero,
    exchange: Exchange.UniV3,
  }
}

export function getInputTokenToEthSwapData(
  inputToken: QuoteToken,
): SwapData | null {
  if (inputToken.symbol === ETH.symbol) return null
  if (inputToken.symbol === WETH.symbol) {
    return {
      path: [inputToken.address, EthAddress],
      fees: [],
      pool: AddressZero,
      exchange: Exchange.None,
    }
  }
  return {
    path: [inputToken.address, WETH.address!],
    fees: [500],
    pool: AddressZero,
    exchange: Exchange.UniV3,
  }
}
