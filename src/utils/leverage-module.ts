import { createClientWithUrl } from 'utils/clients'
import { type Address, parseAbi } from 'viem'

// Base: https://basescan.org/address/0xc06a6e4d9d5ff9d64bd19fc243ad9b6e5a672699
const AaveV3LeverageModule = '0xC06a6E4d9D5FF9d64BD19fc243aD9B6E5a672699'

export async function usesAaveLeverageModule(
  indexToken: string,
  chainId: number,
  rpcUrl: string,
) {
  const publicClient = createClientWithUrl(chainId, rpcUrl)!
  const modules: Address[] = (await publicClient.readContract({
    address: indexToken as Address,
    abi: parseAbi(['function getModules() view returns (address[])']),
    functionName: 'getModules',
  })) as Address[]
  return modules.includes(AaveV3LeverageModule)
}
