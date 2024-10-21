import { JsonRpcProvider } from '@ethersproject/providers'

export function getRpcProvider(rpcUrl: string) {
  return new JsonRpcProvider({ skipFetchSetup: true, url: rpcUrl })
}
