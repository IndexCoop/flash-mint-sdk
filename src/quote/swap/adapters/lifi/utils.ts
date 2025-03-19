/**
 * Converts slippage to LiFi slippage format:
 * https://apidocs.li.fi/reference/get_v1-quote
 *
 * @param slippage The slippage to convert
 * @returns slippage in LiFi's format (0.005 represents 0.5%)
 */
export function convertToLiFiSlippage(slippage: number): number {
  if (slippage < 0) return 0
  if (slippage > 100) return 1
  return slippage / 100
}
