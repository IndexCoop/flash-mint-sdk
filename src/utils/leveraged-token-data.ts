import type { BigNumber } from '@ethersproject/bignumber'
import type { JsonRpcProvider } from '@ethersproject/providers'

import { getFlashMintLeveragedContractForToken } from 'utils/contracts'

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
