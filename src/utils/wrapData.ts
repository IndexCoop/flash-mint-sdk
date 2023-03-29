import { MoneyMarketIndex } from 'constants/tokens'

export enum IndexTokenMix {
  UNWRAPPED_ONLY = 'UNWRAPPED_ONLY',
  WRAPPED_ONLY = 'WRAPPED_ONLY',
  WRAPPED_UNWRAPPED_MIXED = 'WRAPPED_UNWRAPPED_MIXED',
}

export interface ComponentWrapData {
  integrationName: string // wrap adapter integration name as listed in the IntegrationRegistry for the wrapModule
  wrapData: string // optional wrapData passed to the wrapAdapter
}

const compoundWrapAdapterIntegrationName = 'CompoundWrapV2Adapter'
const ZERO_BYTES = '0x0000000000000000000000000000000000000000'

export function getIndexTokenMix(tokenSymbol: string): IndexTokenMix {
  if (tokenSymbol === MoneyMarketIndex.symbol) {
    return IndexTokenMix.UNWRAPPED_ONLY
  }
  throw new Error('Token not defined')
}

export function getWrapData(tokenMix: IndexTokenMix): ComponentWrapData[] {
  switch (tokenMix) {
    case IndexTokenMix.UNWRAPPED_ONLY:
      return [
        {
          integrationName: '',
          wrapData: ZERO_BYTES,
        },
        {
          integrationName: '',
          wrapData: ZERO_BYTES,
        },
        {
          integrationName: '',
          wrapData: ZERO_BYTES,
        },
        {
          integrationName: '',
          wrapData: ZERO_BYTES,
        },
        {
          integrationName: '',
          wrapData: ZERO_BYTES,
        },
        {
          integrationName: '',
          wrapData: ZERO_BYTES,
        },
      ]
    case IndexTokenMix.WRAPPED_ONLY:
      return [
        {
          integrationName: compoundWrapAdapterIntegrationName,
          wrapData: ZERO_BYTES,
        },
        {
          integrationName: compoundWrapAdapterIntegrationName,
          wrapData: ZERO_BYTES,
        },
        {
          integrationName: compoundWrapAdapterIntegrationName,
          wrapData: ZERO_BYTES,
        },
        {
          integrationName: compoundWrapAdapterIntegrationName,
          wrapData: ZERO_BYTES,
        },
        {
          integrationName: compoundWrapAdapterIntegrationName,
          wrapData: ZERO_BYTES,
        },
        {
          integrationName: compoundWrapAdapterIntegrationName,
          wrapData: ZERO_BYTES,
        },
      ]
    case IndexTokenMix.WRAPPED_UNWRAPPED_MIXED:
      return [
        {
          integrationName: compoundWrapAdapterIntegrationName,
          wrapData: ZERO_BYTES,
        },
        {
          integrationName: '',
          wrapData: ZERO_BYTES,
        },
        {
          integrationName: '',
          wrapData: ZERO_BYTES,
        },
        {
          integrationName: '',
          wrapData: ZERO_BYTES,
        },
        {
          integrationName: '',
          wrapData: ZERO_BYTES,
        },
        {
          integrationName: compoundWrapAdapterIntegrationName,
          wrapData: ZERO_BYTES,
        },
      ]
  }
}
