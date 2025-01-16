import { TheUSDCYieldIndex } from 'constants/tokens'

// https://github.com/IndexCoop/index-deployments/pull/299/files#diff-dbc080e96cf11ca994e727d3b77db7b178aa38a33d24d82850e934c018e4d545
enum IntegrationName {
  aaveV2WrapV2Adapter = 'AaveV2WrapV2Adapter',
  aaveV3WrapV2Adapter = 'AaveV3WrapV2Adapter',
  compoundV3UsdcWrapV2Adapter = 'CompoundV3WrapV2Adapter',
  erc4626WrapV2Adapter = 'ERC4626WrapV2Adapter',
  wrapModuleV2Contract = 'WrapModuleV2',
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
      integrationName: IntegrationName.aaveV3WrapV2Adapter,
      wrapData: ZERO_BYTES,
    },
    {
      integrationName: IntegrationName.compoundV3UsdcWrapV2Adapter,
      wrapData: ZERO_BYTES,
    },
    {
      integrationName: IntegrationName.erc4626WrapV2Adapter,
      wrapData: ZERO_BYTES,
    },
    {
      integrationName: IntegrationName.erc4626WrapV2Adapter,
      wrapData: ZERO_BYTES,
    },
    {
      integrationName: IntegrationName.erc4626WrapV2Adapter,
      wrapData: ZERO_BYTES,
    },
    {
      integrationName: IntegrationName.erc4626WrapV2Adapter,
      wrapData: ZERO_BYTES,
    },
    {
      integrationName: IntegrationName.erc4626WrapV2Adapter,
      wrapData: ZERO_BYTES,
    },
    {
      integrationName: IntegrationName.erc4626WrapV2Adapter,
      wrapData: ZERO_BYTES,
    },
  ]
}
