import { Exchange } from 'utils'

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
