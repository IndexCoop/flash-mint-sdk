import { decodeFunctionData, parseAbi } from 'viem'

import type { Hex } from 'viem'

export function decode(callData: string) {
  const { functionName, args } = decodeFunctionData({
    abi: parseAbi([
      'function exec(address operator, address token, uint256 amount, address target, bytes calldata data)',
    ]),
    data: callData as Hex,
  })
  console.log(functionName, args)
  const [operator, token, amount, target, transformations] = args
  console.log(transformations)
}
