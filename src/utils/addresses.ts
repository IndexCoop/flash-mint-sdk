import { getTokenByChainAndSymbol, isAddressEqual } from '@indexcoop/tokenlists'
import {
  EthAddress,
  ZeroExV2AllowanceHolderContract,
} from 'constants/addresses'

import type { Address } from 'viem'

export function getTokenAddressOrWeth(token: string, chainId: number): Address {
  return isAddressEqual(token, EthAddress)
    ? getTokenByChainAndSymbol(chainId, 'WETH')!.address
    : (token as Address)
}

export function isSameAddress(address1: string, address2: string): boolean {
  return isAddressEqual(address1 as Address, address2 as Address)
}

export function isZeroExV2AllowanceHolderContract(address?: string): boolean {
  return isAddressEqual(address, ZeroExV2AllowanceHolderContract)
}
