import { ABI, getContract } from 'quote/swap/adapters/static/contracts'
import { createClientWithUrl } from 'utils/clients'
import { decodeFunctionResult, encodeFunctionData } from 'viem'
import { base } from 'viem/chains'

import type { Result } from 'quote/interfaces'
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
): Promise<Result<bigint>> {
  const publicClient = createClientWithUrl(chainId, rpcUrl)!

  const contractAddress = getContract(chainId, indexToken)
  const abi = ABI[contractAddress]

  const contractHasFiveArgs =
    contractAddress === '0x8bD6eecCb08bEf1Ad035C078E471A0f5b08eFb42' || // FlashMintLeveragedMorphoV2
    contractAddress === '0xb86E1EEf76Bc835E73B8C80eb786262C33d086D8' // FlashMintLeveragedMorphoAaveLM

  console.log('contractAddress', contractAddress, contractHasFiveArgs)
  console.log(
    chainId === base.id && isMinting && contractHasFiveArgs,
    'isMintingOnBase',
  )
  console.log(
    indexToken,
    indexTokenAmount,
    maxInputAmount,
    swapDataDebtForCollateral,
    swapDataInputToken,
  )

  const functionName = isMinting ? 'getIssueExactSet' : 'getRedeemExactSet'

  const data = encodeFunctionData({
    abi,
    functionName,
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

  try {
    const callResult = await publicClient.call({
      to: contractAddress,
      data,
    })

    if (!callResult || !callResult.data) {
      console.warn('No call result received')
      throw new Error('No call result received')
    }

    const result = decodeFunctionResult({
      abi,
      functionName,
      data: callResult.data,
    })
    return {
      success: true,
      data: result as unknown as bigint,
    }
  } catch (err) {
    return {
      success: false,
      error: {
        code: 'QuoteCallFailed',
        message: 'Quote call failed',
        originalError: err,
      },
    }
  }
}
