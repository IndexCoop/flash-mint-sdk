import { TheUSDCYieldIndex } from 'constants/tokens'

enum IntegrationName {
  aaveV2WrapV2AdapterName = 'AaveV2WrapV2Adapter',
  aaveV3WrapV2AdapterName = 'AaveV3WrapV2Adapter',
  compoundV3UsdcWrapV2AdapterName = 'CompoundV3WrapV2Adapter',
  erc4626WrapV2AdapterName = 'ERC4626WrapV2Adapter',
  wrapModuleV2ContractName = 'WrapModuleV2',
}

export interface ComponentWrapData {
  // wrap adapter integration name as listed in the IntegrationRegistry for the wrapModule
  integrationName: IntegrationName | ''
  // optional wrapData passed to the wrapAdapter
  wrapData: string
}

const ZERO_BYTES = '0x0000000000000000000000000000000000000000'

export function getWrapData(tokenSymbol: string): ComponentWrapData[] {
  if (tokenSymbol !== TheUSDCYieldIndex.symbol) return []
  return [
    {
      integrationName: '',
      wrapData: ZERO_BYTES,
    },
    // TODO: update once rebalanced
    // {
    //   integrationName: aaveV3WrapV2AdapterName,
    //   wrapData: ZERO_BYTES,
    // },
    // {
    //   integrationName: compoundV3WrapV2AdapterName,
    //   wrapData: ZERO_BYTES,
    // },
    // {
    //   integrationName: aaveV2WrapV2AdapterName,
    //   wrapData: ZERO_BYTES,
    // },
    // {
    //   integrationName: erc4626WrapV2AdapterName,
    //   wrapData: ZERO_BYTES,
    // },
  ]
}
