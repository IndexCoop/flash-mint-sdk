export interface ComponentWrapData {
  // wrap adapter integration name as listed in the IntegrationRegistry for the wrapModule
  integrationName: string
  // optional wrapData passed to the wrapAdapter
  wrapData: string
}

// TODO: check that adapter names are static
const aaveV2WrapV2AdapterName = 'Aave_V2_Wrap_V2_Adapter'
const aaveV3WrapV2AdapterName = 'Aave_V3_Wrap_V2_Adapter'
const compoundV3WrapV2AdapterName = 'Compound_V3_USDC_Wrap_V2_Adapter'
const erc4626WrapV2AdapterName = 'ERC4626_Wrap_V2_Adapter'
const ZERO_BYTES = '0x0000000000000000000000000000000000000000'

export function getWrapData(tokenSymbol: string): ComponentWrapData[] {
  // TODO: add check once token is available
  if (tokenSymbol !== 'USDCY') return []
  return [
    {
      integrationName: '',
      wrapData: ZERO_BYTES,
    },
    {
      integrationName: aaveV3WrapV2AdapterName,
      wrapData: ZERO_BYTES,
    },
    {
      integrationName: compoundV3WrapV2AdapterName,
      wrapData: ZERO_BYTES,
    },
    {
      integrationName: aaveV2WrapV2AdapterName,
      wrapData: ZERO_BYTES,
    },
    {
      integrationName: erc4626WrapV2AdapterName,
      wrapData: ZERO_BYTES,
    },
  ]
}
