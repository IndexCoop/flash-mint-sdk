import { AddressZero } from 'constants/addresses'
import { noopSwapData } from 'constants/swapdata'
import { USDC, WETH } from 'constants/tokens'
import { Exchange, SwapData } from 'utils'

export function getComponentsSwapData(isMinting: boolean): SwapData[] {
  /* eslint-disable @typescript-eslint/no-non-null-assertion */
  const path = isMinting
    ? [WETH.address!, USDC.address!]
    : [USDC.address!, WETH.address!]
  return [
    noopSwapData,
    noopSwapData,
    noopSwapData,
    noopSwapData,
    noopSwapData,
    {
      exchange: Exchange.UniV3,
      fees: [500],
      path,
      pool: AddressZero,
    },
  ]
}
