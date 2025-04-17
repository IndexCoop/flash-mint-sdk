import { Exchange } from 'utils'

// Used for hyETH only (old swap data format)
export const noopSwapData: {
  path: string[]
  fees: number[]
  pool: string
  exchange: number
} = {
  path: [],
  fees: [],
  pool: '0x0000000000000000000000000000000000000000',
  exchange: Exchange.None,
}
