import { JsonRpcProvider } from '@ethersproject/providers'

export function getRpcProvider(rpcUrl: string) {
  return new JsonRpcProvider(rpcUrl)
}
