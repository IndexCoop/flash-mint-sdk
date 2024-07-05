import { Exchange, SwapData } from 'utils'

export function getSwapData(): SwapData {
  return {
    exchange: Exchange.Curve,
    path: [
      '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      '0xae7ab96520de3a18e5e111b5eaab095312d7fe84',
    ],
    fees: [],
    pool: '0xdc24316b9ae028f1497c275eb9192a3ea0f67022',
  }
}
