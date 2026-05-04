import { ABI, getContract } from 'quote/swap/adapters/static/contracts'
import { createClientWithUrl } from 'utils/clients'
import type { SwapDataV5 } from 'utils'
import { decodeFunctionResult, encodeFunctionData } from 'viem'
import { base } from 'viem/chains'

import {
  type DexV5ConfigEntry,
  isDexV5Entry,
  noopSwapV5,
  type StaticConfigEntry,
} from './swap-data-config'

import type { Result } from 'quote/interfaces'
import type { Address, PublicClient } from 'viem'

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

// Minimal ABI of the V3-style issuance module getRequired*Units views.
const ISSUANCE_MODULE_VIEWS_ABI = [
  {
    inputs: [
      { name: '_setToken', type: 'address' },
      { name: '_quantity', type: 'uint256' },
    ],
    name: 'getRequiredComponentIssuanceUnits',
    outputs: [
      { name: 'components', type: 'address[]' },
      { name: 'equityUnits', type: 'uint256[]' },
      { name: 'debtUnits', type: 'uint256[]' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: '_setToken', type: 'address' },
      { name: '_quantity', type: 'uint256' },
    ],
    name: 'getRequiredComponentRedemptionUnits',
    outputs: [
      { name: 'components', type: 'address[]' },
      { name: 'equityUnits', type: 'uint256[]' },
      { name: 'debtUnits', type: 'uint256[]' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const

/**
 * Returns a copy of `entry` whose `componentSwapDataIssue` (when minting) or
 * `componentSwapDataRedeem` (when redeeming) has each per-component swap
 * replaced with `noopSwap` for any component the issuance module reports as
 * 0-amount at this `indexTokenAmount`.
 *
 * Background: DebtIssuanceModuleV3 may return 0 for the equity unit of a
 * tiny dust component (e.g. uSUI3x's USDC dust at small redemption amounts —
 * the per-set unit floors to ≤ tokenTransferBuffer, so the buffer-subtraction
 * clamps to 0). FlashMintDexV5 then iterates components and calls
 * `dexAdapter.swapExact*` with that 0 amount, which the underlying router
 * (UniV3, Aerodrome SlipStream, …) rejects. Substituting `noopSwap`
 * (`Exchange.None`) makes DEXAdapterV5 short-circuit the call and return 0
 * cleanly — the contract still mints / redeems correctly, it just doesn't
 * route a meaningless 0-amount swap through a router.
 *
 * Returns the entry unmodified if the lookup fails (best-effort — the
 * pre-substitution path already worked at non-trivial amounts and the static
 * fallback keeps that working).
 */
export async function resolveDexV5SwapDataForAmount(
  entry: DexV5ConfigEntry,
  indexToken: Address,
  indexTokenAmount: bigint,
  isMinting: boolean,
  chainId: number,
  rpcUrl: string,
): Promise<DexV5ConfigEntry> {
  try {
    const publicClient = createClientWithUrl(chainId, rpcUrl)!
    const result = (await publicClient.readContract({
      address: BASE_DEBT_ISSUANCE_MODULE_V3 as Address,
      abi: ISSUANCE_MODULE_VIEWS_ABI,
      functionName: isMinting
        ? 'getRequiredComponentIssuanceUnits'
        : 'getRequiredComponentRedemptionUnits',
      args: [indexToken, indexTokenAmount],
    })) as readonly [readonly Address[], readonly bigint[], readonly bigint[]]
    const equityUnits = result[1]

    const staticSwaps = isMinting
      ? entry.componentSwapDataIssue
      : entry.componentSwapDataRedeem
    if (staticSwaps.length !== equityUnits.length) return entry

    let substituted = false
    const resolved: SwapDataV5[] = staticSwaps.map((swap, i) => {
      if (equityUnits[i] === BigInt(0)) {
        substituted = true
        return noopSwapV5
      }
      return swap
    })
    if (!substituted) return entry
    return isMinting
      ? { ...entry, componentSwapDataIssue: resolved }
      : { ...entry, componentSwapDataRedeem: resolved }
  } catch {
    return entry
  }
}

// `publicClient` parameter type used by callers wanting to share a client.
export type _DexV5PublicClient = PublicClient

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
