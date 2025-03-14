import { FlashMintAbis } from 'utils/abis'
import { createClientWithUrl } from 'utils/clients'
import { getFlashMintLeveragedContractForToken } from 'utils/contracts'

import type { BigNumber } from '@ethersproject/bignumber'
import type { JsonRpcProvider } from '@ethersproject/providers'
import type { Address } from 'viem'

export interface LeveragedTokenData {
  collateralAToken: string
  collateralToken: string
  debtToken: string
  collateralAmount: BigNumber
  debtAmount: BigNumber
}

export async function getLeveragedTokenData(
  indexTokenAddress: string,
  indexTokenAmount: BigNumber,
  indexTokenSymbol: string,
  isIssuance: boolean,
  chainId: number,
  provider: JsonRpcProvider,
): Promise<LeveragedTokenData | null> {
  try {
    const contract = getFlashMintLeveragedContractForToken(
      indexTokenSymbol,
      provider,
      chainId,
    )
    return await contract.getLeveragedTokenData(
      indexTokenAddress,
      indexTokenAmount,
      isIssuance,
    )
  } catch (error) {
    // Should this just always fail cause it means there is something wrongly configured?
    console.error('Error getting leveraged token data', error)
    return null
  }
}

type GetLeveragedTokenDataParams = {
  indexTokenAddress: string
  indexTokenAmount: bigint
  isIssuance: boolean
  isAave: boolean
}

export async function getLeveragedZeroExTokenData(
  contract: Address,
  params: GetLeveragedTokenDataParams,
  chainId: number,
  rpcUrl: string,
): Promise<LeveragedTokenData | null> {
  try {
    const { indexTokenAddress, indexTokenAmount, isIssuance, isAave } = params
    const abi = FlashMintAbis[contract]
    const publicClient = createClientWithUrl(chainId, rpcUrl)!
    const data = await publicClient.readContract({
      address: contract,
      abi,
      functionName: 'getLeveragedTokenData',
      args: [indexTokenAddress, indexTokenAmount, isIssuance, isAave],
    })
    return data as LeveragedTokenData | null
  } catch (error) {
    console.error('Error getting leveraged token data:', error)
    return null
  }
}
