import { createClientWithUrl } from 'utils/clients'
import { type Address, parseAbi } from 'viem'

const AaveV3LeverageModule: { [key: number]: Address } = {
  1: '0x9d08CCeD85A68Bf8A19374ED4B5753aE3Be9F74f',
  8453: '0xC06a6E4d9D5FF9d64BD19fc243aD9B6E5a672699',
}

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
  return modules.includes(AaveV3LeverageModule[chainId])
}
