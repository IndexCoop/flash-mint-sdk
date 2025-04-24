import { ABI, getContract } from 'quote/swap/adapters/static/contracts'
import { createClientWithUrl } from 'utils/clients'
import { base } from 'viem/chains'

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
  const abi = ABI[contractAddress]

  const contractHasFiveArgs =
    contractAddress === '0x8bD6eecCb08bEf1Ad035C078E471A0f5b08eFb42' || // FlashMintLeveragedMorphoV2
    contractAddress === '0xb86E1EEf76Bc835E73B8C80eb786262C33d086D8' // FlashMintLeveragedMorphoAaveLM

  const result = await publicClient.simulateContract({
    address: contractAddress,
    abi,
    functionName: isMinting ? 'getIssueExactSet' : 'getRedeemExactSet',
    args:
      chainId === base.id && isMinting && contractHasFiveArgs
        ? [
            indexToken,
            indexTokenAmount,
            maxInputAmount,
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
