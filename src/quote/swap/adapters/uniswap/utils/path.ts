import { type Address, encodePacked } from 'viem'

import { isSameAddress } from 'utils'

const weth = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'

export function encodePathV3(
  path: string[],
  fees: number[],
  reverseOrder: boolean,
): string {
  if (reverseOrder) {
    let encodedPath = encodePacked(
      ['address'],
      [path[path.length - 1] as Address],
    )
    for (let i = 0; i < fees.length; i++) {
      const index = fees.length - i - 1
      encodedPath = encodePacked(
        ['bytes', 'uint24', 'address'],
        [encodedPath as `0x${string}`, fees[index], path[index] as Address],
      )
      console.log(encodedPath, i)
    }
    return encodedPath
  }
  let encodedPath = encodePacked(['address'], [path[0] as Address])
  console.log(encodedPath)
  for (let i = 0; i < fees.length; i++) {
    encodedPath = encodePacked(
      ['bytes', 'uint24', 'address'],
      [encodedPath as `0x${string}`, fees[i], path[i + 1] as Address],
    )
    console.log(encodedPath, i)
  }
  return encodedPath
}

function isWeth(token: string) {
  return isSameAddress(token, weth)
}

export function getPath(inputToken: string, outputToken: string): string[] {
  const inputTokenIsWeth = isWeth(inputToken)
  const outputTokenIsWeth = isWeth(outputToken)
  if (inputTokenIsWeth || outputTokenIsWeth) {
    return [inputToken, outputToken]
  }
  return [inputToken, weth, outputToken]
}
