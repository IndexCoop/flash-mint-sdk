import { getTokenByChainAndSymbol, isAddressEqual } from '@indexcoop/tokenlists'
import { decodeFunctionData } from 'viem'

import { EthAddress } from 'constants/addresses'
import { SettlerActionsABI } from './abis/SettlerActions'
import { convertFrom0xFeesToUniPool, exchangeFrom0xSource } from './utils'

import type { SwapDataV5 } from 'utils'
import type { Hex } from 'viem'

enum SettlerAction {
  AerodromeV3 = 'AERODROMEV3',
  UniswapV3 = 'UNISWAPV3',
}

// TBD if this is needed
// function getMappedSource(source: string) {
//   switch (source) {
//     case 'Aerodrome_V3':
//       return 'AERODROMEV3'
//     case 'Uniswap_V3':
//       return 'UNISWAPV3'
//     case 'Uniswap_V2':
//       return 'UNISWAPV2'
//     case 'Sushiswap':
//       return 'SUSHISWAP'
//     case 'Balancer':
//       return 'BALANCER'
//     case 'Curve':
//       return 'CURVE'
//     case 'Kyber':
//       return 'KYBER'
//     case 'LiquidityProvider':
//       return 'LIQUIDITYPROVIDER'
//     case 'Mooniswap':
//       return 'MOONISWAP'
//     case 'MultiHop':
//       return 'MULTIHOP'
//     default:
//       return source
//   }
// }

function decodeUniPath(path: string): string[] {
  const addressSize = 40
  const tokenA = path.slice(0, addressSize + 2) // incl 0x
  const tokenB = `0x${path.slice(path.length - addressSize, path.length)}`
  return [tokenA, tokenB]
}

function isValidPath(
  path: string[],
  chainId: number,
  inputToken: string,
  outputToken: string,
): boolean {
  if (path.length < 2) return false
  const weth = getTokenByChainAndSymbol(chainId, 'WETH')!.address
  const inputTokenAddress = isAddressEqual(inputToken, EthAddress)
    ? weth
    : inputToken
  if (!isAddressEqual(path[0], inputTokenAddress)) return false
  const outputTokenAddress = isAddressEqual(outputToken, EthAddress)
    ? weth
    : outputToken
  if (!isAddressEqual(path[path.length - 1], outputTokenAddress)) return false
  return true
}

export function decodeActions(
  actions: Hex[],
  source: string,
  chainId: number,
  inputToken: string,
  outputToken: string,
): SwapDataV5 | null {
  const actionsData = actions!.map((action: Hex) =>
    decodeFunctionData({
      abi: SettlerActionsABI,
      data: action,
    }),
  )

  const isMultiPath =
    actionsData.map((action) => action.functionName === SettlerAction.UniswapV3)
      .length > 1

  const fees: number[] = []
  let path: string[] = []
  for (const action of actionsData) {
    // Aerodome is returned as `UNISWAPV3` fork, so checking for the action would
    // not work: `if (action.functionName === SettlerAction.AerodromeV3)`
    if (action.functionName === SettlerAction.UniswapV3) {
      // function UNISWAPV3(address recipient, uint256 bps, bytes memory path, uint256 amountOutMin) external
      const [, bps, uniPath] = action.args
      fees.push(convertFrom0xFeesToUniPool(bps))
      if (isMultiPath) {
        const decodedPath = decodeUniPath(uniPath)
        if (path.length === 0) {
          path = decodedPath
        } else {
          path.push(decodedPath[1])
        }
      } else {
        path = decodeUniPath(uniPath)
      }
    }
  }

  if (!isValidPath(path, chainId, inputToken, outputToken)) {
    console.error('Invalid path')
    return null
  }

  return {
    exchange: exchangeFrom0xSource[source],
    path,
    fees,
    pool: '',
    poolIds: [],
    tickSpacing: [],
  }
}
