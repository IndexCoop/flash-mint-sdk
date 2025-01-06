import { type Address, parseAbi } from 'viem'
import { createClient } from './clients'

export async function getBalanceOf(
  token: Address,
  account: Address,
  chainId: number,
) {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const publicClient = createClient(chainId)!
  const amount: bigint = (await publicClient.readContract({
    address: token,
    abi: parseAbi([
      'function balanceOf(address account) view returns (uint256)',
    ]),
    functionName: 'balanceOf',
    args: [account],
  })) as bigint
  return amount
}
