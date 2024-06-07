/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { AddressZero, EthAddress } from 'constants/addresses'
import { noopSwapData } from 'constants/swapdata'
import { ETH, USDC, WETH } from 'constants/tokens'
import { QuoteToken } from 'quote/interfaces'
import { Exchange, SwapData } from 'utils'

export function getComponentsSwapData(isMinting: boolean): SwapData[] {
  // const path = isMinting
  //   ? [WETH.address!, USDC.address!]
  //   : [USDC.address!, WETH.address!]
  return [
    noopSwapData,
    noopSwapData,
    noopSwapData,
    noopSwapData,
    noopSwapData,
    // {
    //   exchange: Exchange.UniV3,
    //   fees: [500],
    //   path,
    //   pool: AddressZero,
    // },
  ]
}

export function getEthToInputOutputTokenSwapData(
  inputOutputToken: QuoteToken
): SwapData | null {
  if (inputOutputToken.symbol === WETH.symbol) {
    return {
      path: [EthAddress, inputOutputToken.address],
      fees: [],
      pool: AddressZero,
      exchange: Exchange.None,
    }
  }
  if (inputOutputToken.symbol === USDC.symbol) {
    return {
      path: [WETH.address!, inputOutputToken.address],
      fees: [500],
      pool: AddressZero,
      exchange: Exchange.UniV3,
    }
  }
  return null
}

export function getInputTokenToEthSwapData(
  inputToken: QuoteToken
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
  if (inputToken.symbol === USDC.symbol) {
    return {
      path: [inputToken.address, WETH.address!],
      fees: [500],
      pool: AddressZero,
      exchange: Exchange.UniV3,
    }
  }
  return null
}
