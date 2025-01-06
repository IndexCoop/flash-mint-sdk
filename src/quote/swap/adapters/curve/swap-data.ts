import { WETH, stETH } from 'constants/tokens'
import { Exchange, type SwapData } from 'utils'

export function getSwapData(): SwapData {
  // The curve adapter is mostly just used for ETH/stETH swapping, so we can
  // hard-code the return here.
  return {
    exchange: Exchange.Curve,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    path: [WETH.address!, stETH.address!],
    fees: [], // not needed for curve
    pool: '0xdc24316b9ae028f1497c275eb9192a3ea0f67022',
  }
}
