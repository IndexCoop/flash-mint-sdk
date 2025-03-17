import { isAddressEqual } from '@indexcoop/tokenlists'
import { ZeroExV2AllowanceHolderContract } from 'constants/addresses'

import type { Address } from 'viem'

export function isSameAddress(address1: string, address2: string): boolean {
  return isAddressEqual(address1 as Address, address2 as Address)
}

export function isZeroExV2AllowanceHolderContract(address?: string): boolean {
  return isAddressEqual(address, ZeroExV2AllowanceHolderContract)
}
