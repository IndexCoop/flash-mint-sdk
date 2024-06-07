import { Address, isAddressEqual } from 'viem'

export function isSameAddress(address1: string, address2: string): boolean {
  return isAddressEqual(address1 as Address, address2 as Address)
}
