import { getTokenByChainAndSymbol, isAddressEqual } from '@indexcoop/tokenlists'

import { Contracts } from 'constants/contracts'
import { FlashMintAbis } from 'utils/abis'
import { createClientWithUrl } from 'utils/clients'

import type { BigNumber } from '@ethersproject/bignumber'
import type { Result } from 'quote/interfaces'
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
): Promise<Result<LeveragedZeroExTokenData | null>> {
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
    return {
      success: true,
      data: data as LeveragedZeroExTokenData | null,
    }
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'GetLeveragedZeroExTokenDataError',
        message: `Error getting leveraged zeroex token data: ${error}`,
      },
    }
  }
}
