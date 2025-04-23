import { ABI, getContract } from 'quote/swap/adapters/static/contracts'
import { createClientWithUrl } from 'utils/clients'

import type { SwapData, SwapDataV5 } from 'utils'
import type { Address } from 'viem'

export async function getQuote(
  isMinting: boolean,
  indexToken: Address,
  indexTokenAmount: bigint,
  maxInputAmount: bigint,
  swapDataDebtForCollateral: SwapData | SwapDataV5,
  swapDataInputToken: SwapData | SwapDataV5,
  chainId: number,
  rpcUrl: string,
): Promise<bigint> {
  const publicClient = createClientWithUrl(chainId, rpcUrl)!

  const contractAddress = getContract(chainId, indexToken)
  console.log('contractAddress', contractAddress)
  const abi = ABI[contractAddress]

  const result = await publicClient.simulateContract({
    address: contractAddress,
    abi,
    functionName: isMinting ? 'getIssueExactSet' : 'getRedeemExactSet',
    args:
      chainId === 8453 && isMinting
        ? [
            indexToken,
            indexTokenAmount,
            // FIXME: have to use max input amount?
            BigInt(0),
            swapDataDebtForCollateral,
            swapDataInputToken,
          ]
        : [
            indexToken,
            indexTokenAmount,
            swapDataDebtForCollateral,
            swapDataInputToken,
          ],
  })

  return result.result as unknown as bigint
}
