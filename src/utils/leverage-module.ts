import { getTokenByChainAndSymbol, isAddressEqual } from '@indexcoop/tokenlists'
import { createClientWithUrl } from 'utils/clients'
import { type Address, parseAbi } from 'viem'

import type { Result } from 'quote/interfaces'

const AaveV3LeverageModule: { [key: number]: Address } = {
  1: '0x9d08CCeD85A68Bf8A19374ED4B5753aE3Be9F74f',
  8453: '0xC06a6E4d9D5FF9d64BD19fc243aD9B6E5a672699',
  42161: '0x6D1b74e18064172D028C5EE7Af5D0ccC26f2A4Ae',
}

export async function usesAaveLeverageModule(
  indexToken: string,
  chainId: number,
  rpcUrl: string,
): Promise<Result<boolean>> {
  try {
    const isIcEth = isAddressEqual(
      getTokenByChainAndSymbol(1, 'icETH').address,
      indexToken,
    )
    // https://etherscan.io/address/0x251bd1d42df1f153d86a5ba2305faade4d5f51dc
    const leverageModule = isIcEth
      ? '0x251Bd1D42Df1f153D86a5BA2305FaADE4D5f51DC'
      : AaveV3LeverageModule[chainId]
    const publicClient = createClientWithUrl(chainId, rpcUrl)!
    const modules: Address[] = (await publicClient.readContract({
      address: indexToken as Address,
      abi: parseAbi(['function getModules() view returns (address[])']),
      functionName: 'getModules',
    })) as Address[]
    return {
      success: true,
      data: modules.includes(leverageModule),
    }
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'UsesAaveLeverageModuleError',
        message: `Failed to get modules: ${error}`,
      },
    }
  }
}
