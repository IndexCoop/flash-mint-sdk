import { decodeFunctionData } from 'viem'

import { SettlerActionsABI } from './abis/SettlerActions'
import { getEchangeFrom0xKey } from './utils'

import type { SwapDataV3 } from 'utils'
import type { Hex } from 'viem'

function getMappedSource(source: string) {
  switch (source) {
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
  let swapData: SwapDataV3 | null = null
  for (const action of actionsData) {
    console.log(action)
    const mappedFunctionName = getMappedSource(action.functionName)
    if (action.functionName === 'UNISWAPV3') {
      // function UNISWAPV3(address recipient, uint256 bps, bytes memory path, uint256 amountOutMin) external;
      const [recipient, bps, path] = action.args
      const exchange = getEchangeFrom0xKey(source)
      if (!exchange) {
        throw new Error('Invalid exchange')
      }
      swapData = {
        exchange,
        // TODO:
        path: [],
        fees: [Number((bps / BigInt(100)).toString())],
        pool: '',
        poolIds: [],
      }
    }
  }
  return swapData
}
