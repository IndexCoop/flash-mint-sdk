import { isSameAddress } from 'utils'

const weth = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'

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
