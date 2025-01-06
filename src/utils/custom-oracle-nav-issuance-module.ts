import { type Address, parseAbi } from 'viem'

import { Contracts } from 'constants/contracts'
import { createClient } from 'utils/clients'

export async function getExpectedReserveRedeemQuantity(
  chainId: number,
  indexToken: Address,
  reserveAsset: Address,
  indexTokenAmount: bigint,
): Promise<bigint> {
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
