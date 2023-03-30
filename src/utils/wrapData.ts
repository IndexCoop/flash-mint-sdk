import { MoneyMarketIndex } from 'constants/tokens'

export interface ComponentWrapData {
  integrationName: string // wrap adapter integration name as listed in the IntegrationRegistry for the wrapModule
  wrapData: string // optional wrapData passed to the wrapAdapter
}

// const compoundWrapAdapterIntegrationName = 'CompoundWrapV2Adapter'
const erc4626WrapV2AdapterName = 'ERC4626WrapV2Adapter'
const ZERO_BYTES = '0x0000000000000000000000000000000000000000'

export function getWrapData(tokenSymbol: string): ComponentWrapData[] {
  if (tokenSymbol !== MoneyMarketIndex.symbol) return []
  return [
    {
      integrationName: erc4626WrapV2AdapterName,
      wrapData: ZERO_BYTES,
    },
    {
      integrationName: erc4626WrapV2AdapterName,
      wrapData: ZERO_BYTES,
    },
    {
      integrationName: erc4626WrapV2AdapterName,
      wrapData: ZERO_BYTES,
    },
    {
      integrationName: erc4626WrapV2AdapterName,
      wrapData: ZERO_BYTES,
    },
    {
      integrationName: erc4626WrapV2AdapterName,
      wrapData: ZERO_BYTES,
    },
    {
      integrationName: erc4626WrapV2AdapterName,
      wrapData: ZERO_BYTES,
    },
  ]
}
