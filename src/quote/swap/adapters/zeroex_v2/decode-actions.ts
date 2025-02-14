import { decodeFunctionData } from 'viem'

import { SettlerActionsABI } from './abis/SettlerActions'
import { getExchangeFrom0xSource } from './utils'

import { type SwapDataV3, decodePool } from 'utils'
import type { Hex } from 'viem'

enum SettlerAction {
  AerodromeV3 = 'AERODROMEV3',
  UniswapV3 = 'UNISWAPV3',
}

function getMappedSource(source: string) {
  switch (source) {
    case 'Aerodrome_V3':
      return 'AERODROMEV3'
    case 'Uniswap_V3':
      return 'UNISWAPV3'
    case 'Uniswap_V2':
      return 'UNISWAPV2'
    case 'Sushiswap':
      return 'SUSHISWAP'
    case 'Balancer':
      return 'BALANCER'
    case 'Curve':
      return 'CURVE'
    case 'Kyber':
      return 'KYBER'
    case 'LiquidityProvider':
      return 'LIQUIDITYPROVIDER'
    case 'Mooniswap':
      return 'MOONISWAP'
    case 'MultiHop':
      return 'MULTIHOP'
    default:
      return source
  }
}

// TODO: add input/output token?
export function decodeActions(
  actions: Hex[],
  source: string,
): SwapDataV3 | null {
  const actionsData = actions!.map((action: Hex) =>
    decodeFunctionData({
      abi: SettlerActionsABI,
      data: action,
    }),
  )
  console.log(actionsData)
  let fees: number[] = []
  let path: string[] = []
  // TODO: probably doesn't work with multi paths
  for (const action of actionsData) {
    const mappedFunctionName = getMappedSource(source)
    console.log(
      action.functionName,
      action.functionName === SettlerAction.UniswapV3,
    )
    // TODO: is returned as uniswapv3, so this will not work
    // if (action.functionName === SettlerAction.AerodromeV3) {
    if (action.functionName === SettlerAction.UniswapV3) {
      // function UNISWAPV3(address recipient, uint256 bps, bytes memory path, uint256 amountOutMin) external;
      const [recipient, bps, uniPath] = action.args
      fees = [Number((bps / BigInt(100)).toString())]
      path = decodePool(uniPath).tokens
    }
  }
  return {
    exchange: getExchangeFrom0xSource(source)!,
    path,
    fees,
    pool: '',
    poolIds: [],
  }
}
