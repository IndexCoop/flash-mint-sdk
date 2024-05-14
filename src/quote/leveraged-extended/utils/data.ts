import { BigNumber } from '@ethersproject/bignumber'
import { JsonRpcProvider } from '@ethersproject/providers'

import { getFlashMintLeveragedContractForToken } from 'utils/contracts'

import { LeveragedTokenData } from '../provider'

export async function getLeveragedTokenData(
  indexTokenAddress: string,
  indexTokenAmount: BigNumber,
  indexTokenSymbol: string,
  isIssuance: boolean,
  chainId: number,
  provider: JsonRpcProvider
): Promise<LeveragedTokenData | null> {
  try {
    const contract = getFlashMintLeveragedContractForToken(
      indexTokenSymbol,
      provider,
      chainId
    )
    return await contract.getLeveragedTokenData(
      indexTokenAddress,
      indexTokenAmount,
      isIssuance
    )
  } catch (error) {
    // TODO: should this just always fail cause it means there is something wrongly configured?
    console.error('Error getting leveraged token data', error)
    return null
  }
}
