import { BigNumber } from '@ethersproject/bignumber'

import { wei } from '../utils/numbers'

/**
 * Returns slippage adjusted token amount based on minting/redeeming.
 * @param tokenAmount     The token amount to be adjusted
 * @param tokenDecimals   The token's decimals
 * @param slippage        The slippage in percent: 0.1 - 100
 * @param isMinting      Whether minting or redeeming
 */
export function slippageAdjustedTokenAmount(
  tokenAmount: BigNumber,
  tokenDecimals: number,
  slippage: number,
  isMinting: boolean
): BigNumber {
  if (isMinting) {
    return tokenAmount
      .mul(wei(100, tokenDecimals))
      .div(wei(100 - slippage, tokenDecimals))
  }

  return tokenAmount
    .mul(wei(100, tokenDecimals))
    .div(wei(100 + slippage, tokenDecimals))
}
