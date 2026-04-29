import { ABI, getContract } from 'quote/swap/adapters/static/contracts'
import { createClientWithUrl } from 'utils/clients'
import { decodeFunctionResult, encodeFunctionData } from 'viem'
import { base } from 'viem/chains'

import {
  type DexV5ConfigEntry,
  isDexV5Entry,
  type StaticConfigEntry,
} from './swap-data-config'

import type { Result } from 'quote/interfaces'
import type { Address } from 'viem'

// DebtIssuanceModuleV3 on Base. Used as the issuanceModule param for
// FlashMintDexV5 IssueRedeemParams.
const BASE_DEBT_ISSUANCE_MODULE_V3 =
  '0xa30E87311407dDcF1741901A8F359b6005252F22'

export async function getQuote(
  isMinting: boolean,
  indexToken: Address,
  indexTokenAmount: bigint,
  maxInputAmount: bigint,
  entry: StaticConfigEntry,
  chainId: number,
  rpcUrl: string,
): Promise<Result<bigint>> {
  const publicClient = createClientWithUrl(chainId, rpcUrl)!

  const contractAddress = getContract(chainId, indexToken)
  const abi = ABI[contractAddress]

  const functionName = isMinting ? 'getIssueExactSet' : 'getRedeemExactSet'

  const data = isDexV5Entry(entry)
    ? encodeFunctionData({
        abi,
        functionName,
        args: [
          buildIssueRedeemParams(indexToken, indexTokenAmount, isMinting, entry),
          isMinting ? entry.swapDataInputToWeth : entry.swapDataWethToInput,
        ],
      })
    : encodeLeveragedQuoteCall(
        abi,
        functionName,
        contractAddress,
        chainId,
        isMinting,
        indexToken,
        indexTokenAmount,
        maxInputAmount,
        entry.swapDataDebtForCollateral,
        entry.swapDataInputToken,
      )

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

export function buildIssueRedeemParams(
  indexToken: Address,
  indexTokenAmount: bigint,
  isMinting: boolean,
  entry: DexV5ConfigEntry,
) {
  return {
    setToken: indexToken,
    amountSetToken: indexTokenAmount,
    componentSwapData: isMinting
      ? entry.componentSwapDataIssue
      : entry.componentSwapDataRedeem,
    issuanceModule: BASE_DEBT_ISSUANCE_MODULE_V3 as Address,
    isDebtIssuance: true,
  }
}

function encodeLeveragedQuoteCall(
  abi: any,
  functionName: string,
  contractAddress: Address,
  chainId: number,
  isMinting: boolean,
  indexToken: Address,
  indexTokenAmount: bigint,
  maxInputAmount: bigint,
  swapDataDebtForCollateral: unknown,
  swapDataInputToken: unknown,
): `0x${string}` {
  const contractHasFiveArgs =
    contractAddress === '0x8bD6eecCb08bEf1Ad035C078E471A0f5b08eFb42' || // FlashMintLeveragedMorphoV2
    contractAddress === '0xb86E1EEf76Bc835E73B8C80eb786262C33d086D8' // FlashMintLeveragedMorphoAaveLM

  return encodeFunctionData({
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
}
