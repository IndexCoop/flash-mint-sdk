import { Address, parseAbi } from 'viem'

import { ChainId } from 'constants/chains'
import { Contracts } from 'constants/contracts'
import { createClient } from 'utils/clients'

export async function getExpectedReserveRedeemQuantity(
  indexToken: Address,
  reserveAsset: Address,
  indexTokenAmount: bigint
): Promise<bigint> {
  const chainId = ChainId.Mainnet
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const publicClient = createClient(chainId)!
  const amount: bigint = (await publicClient.readContract({
    address: Contracts[chainId].CustomOracleNavIssuanceModule,
    abi: parseAbi([
      'function getExpectedReserveRedeemQuantity(address _setToken, address _reserveAsset, uint256 _setTokenQuantity) view returns (uint256)',
    ]),
    functionName: 'getExpectedReserveRedeemQuantity',
    args: [indexToken, reserveAsset, indexTokenAmount],
  })) as bigint
  return amount
}
