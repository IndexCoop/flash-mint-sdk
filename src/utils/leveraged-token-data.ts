import { getTokenByChainAndSymbol, isAddressEqual } from '@indexcoop/tokenlists'

import { Contracts } from 'constants/contracts'
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

export interface LeveragedZeroExTokenData {
  collateralAToken: string
  collateralToken: string
  debtToken: string
  collateralAmount: bigint
  debtAmount: bigint
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
  indexTokenAddress: Address
  indexTokenAmount: bigint
  isIssuance: boolean
  isAave: boolean
}

export async function getLeveragedZeroExTokenData(
  params: GetLeveragedTokenDataParams,
  chainId: number,
  rpcUrl: string,
): Promise<LeveragedZeroExTokenData | null> {
  try {
    const { indexTokenAddress, indexTokenAmount, isIssuance, isAave } = params
    const isIcEth = isAddressEqual(
      indexTokenAddress,
      getTokenByChainAndSymbol(1, 'icETH').address,
    )
    const contract = isIcEth
      ? Contracts[1].FlashMintLeveragedZeroEx_AaveV2
      : Contracts[chainId].FlashMintLeveragedZeroEx
    const abi = FlashMintAbis[contract]
    const publicClient = createClientWithUrl(chainId, rpcUrl)!
    const data = await publicClient.readContract({
      address: contract,
      abi,
      functionName: 'getLeveragedTokenData',
      args: [indexTokenAddress, indexTokenAmount, isIssuance, isAave],
    })
    return data as LeveragedZeroExTokenData | null
  } catch (error) {
    console.error('Error getting leveraged zeroex token data:', error)
    return null
  }
}
