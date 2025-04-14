import { getTokenByChainAndSymbol } from '@indexcoop/tokenlists'

import { ChainId } from 'constants/chains'
import {
  BasicIssuanceModuleAddress,
  Contracts,
  DebtIssuanceModuleV2Address,
  IndexDebtIssuanceModuleV2Address_v2,
} from 'constants/contracts'

import { getIssuanceModule } from './issuance-modules'

describe('getIssuanceModule() - Mainnet - IndexProtocol', () => {
  test('returns debt issuance module v2 for BTC2X', async () => {
    const expectedModule = IndexDebtIssuanceModuleV2Address_v2
    const issuanceModule = getIssuanceModule('BTC2X')
    expect(issuanceModule.address).toEqual(expectedModule)
    expect(issuanceModule.isDebtIssuance).toBe(true)
  })

  test('returns debt issuance module v2 for BTC2xETH', () => {
    const expectedModule = Contracts[ChainId.Arbitrum].DebtIssuanceModuleV3
    const issuanceModule = getIssuanceModule('BTC2xETH', ChainId.Arbitrum)
    expect(issuanceModule.address).toEqual(expectedModule)
    expect(issuanceModule.isDebtIssuance).toBe(true)
  })

  test('returns debt issuance module v2 for ETH2X', async () => {
    const expectedModule = IndexDebtIssuanceModuleV2Address_v2
    const issuanceModule = getIssuanceModule('ETH2X')
    expect(issuanceModule.address).toEqual(expectedModule)
    expect(issuanceModule.isDebtIssuance).toBe(true)
  })

  test('returns debt issuance module v2 for ETH2xBTC', () => {
    const expectedModule = Contracts[ChainId.Arbitrum].DebtIssuanceModuleV3
    const issuanceModule = getIssuanceModule('ETH2xBTC', ChainId.Arbitrum)
    expect(issuanceModule.address).toEqual(expectedModule)
    expect(issuanceModule.isDebtIssuance).toBe(true)
  })

  test('returns debt issuance module v2 for hyETH', async () => {
    const expectedModule = IndexDebtIssuanceModuleV2Address_v2
    const issuanceModule = getIssuanceModule('hyETH')
    expect(issuanceModule.address).toEqual(expectedModule)
    expect(issuanceModule.isDebtIssuance).toBe(true)
  })
})

describe('getIssuanceModule() - Mainnet - SetProtocol', () => {
  test('returns basic issuance module for DPI', async () => {
    const expectedModule = BasicIssuanceModuleAddress
    const issuanceModule = getIssuanceModule('DPI')
    expect(issuanceModule.address).toEqual(expectedModule)
    expect(issuanceModule.isDebtIssuance).toBe(false)
  })

  test('returns basic issuance module for MVI', async () => {
    const expectedModule = BasicIssuanceModuleAddress
    const issuanceModule = getIssuanceModule('MVI')
    expect(issuanceModule.address).toEqual(expectedModule)
    expect(issuanceModule.isDebtIssuance).toBe(false)
  })

  test('returns debt issuance module v2 for icETH', async () => {
    const expectedModule = DebtIssuanceModuleV2Address
    const issuanceModule = getIssuanceModule(
      getTokenByChainAndSymbol(ChainId.Mainnet, 'icETH').symbol,
    )
    expect(issuanceModule.address).toEqual(expectedModule)
    expect(issuanceModule.isDebtIssuance).toBe(true)
  })
})

describe('getIssuanceModule() - Arbitrum', () => {
  test('returns debt issuance module v3 for BTC2X on Arbitrum', async () => {
    const expectedModule = Contracts[ChainId.Arbitrum].DebtIssuanceModuleV3
    const issuanceModule = getIssuanceModule('BTC2X', ChainId.Arbitrum)
    expect(issuanceModule.address).toEqual(expectedModule)
    expect(issuanceModule.isDebtIssuance).toBe(true)
  })

  test('returns debt issuance module v3 for BTC3X', async () => {
    const expectedModule = Contracts[ChainId.Arbitrum].DebtIssuanceModuleV3
    const issuanceModule = getIssuanceModule('BTC3X', ChainId.Arbitrum)
    expect(issuanceModule.address).toEqual(expectedModule)
    expect(issuanceModule.isDebtIssuance).toBe(true)
  })
})

describe('getIssuanceModule() - Base', () => {
  test('returns debt issuance module v3 for BTC2X on Base', async () => {
    const chainId = ChainId.Base
    const expectedModule = Contracts[chainId].DebtIssuanceModuleV3
    const issuanceModule = getIssuanceModule(
      getTokenByChainAndSymbol(chainId, 'BTC2X').symbol,
      chainId,
    )
    expect(issuanceModule.address).toEqual(expectedModule)
    expect(issuanceModule.isDebtIssuance).toBe(true)
  })

  test('returns debt issuance module v3 for BTC3X', async () => {
    const chainId = ChainId.Base
    const expectedModule = Contracts[chainId].DebtIssuanceModuleV3
    const issuanceModule = getIssuanceModule(
      getTokenByChainAndSymbol(chainId, 'BTC3X').symbol,
      chainId,
    )
    expect(issuanceModule.address).toEqual(expectedModule)
    expect(issuanceModule.isDebtIssuance).toBe(true)
  })

  test('returns debt issuance module v3 for ETH2X on Base', async () => {
    const chainId = ChainId.Base
    const expectedModule = Contracts[chainId].DebtIssuanceModuleV3
    const issuanceModule = getIssuanceModule(
      getTokenByChainAndSymbol(chainId, 'ETH2X').symbol,
      chainId,
    )
    expect(issuanceModule.address).toEqual(expectedModule)
    expect(issuanceModule.isDebtIssuance).toBe(true)
  })

  test('returns debt issuance module v3 for ETH3X', async () => {
    const chainId = ChainId.Base
    const expectedModule = Contracts[chainId].DebtIssuanceModuleV3
    const issuanceModule = getIssuanceModule(
      getTokenByChainAndSymbol(chainId, 'ETH3X').symbol,
      chainId,
    )
    expect(issuanceModule.address).toEqual(expectedModule)
    expect(issuanceModule.isDebtIssuance).toBe(true)
  })

  test('returns debt issuance module v3 for uSOL2x on Base', async () => {
    const chainId = ChainId.Base
    const expectedModule = Contracts[chainId].DebtIssuanceModuleV3
    const issuanceModule = getIssuanceModule(
      getTokenByChainAndSymbol(chainId, 'uSOL2x').symbol,
      chainId,
    )
    expect(issuanceModule.address).toEqual(expectedModule)
    expect(issuanceModule.isDebtIssuance).toBe(true)
  })

  test('returns debt issuance module v3 for uSOL3x on Base', async () => {
    const chainId = ChainId.Base
    const expectedModule = Contracts[chainId].DebtIssuanceModuleV3
    const issuanceModule = getIssuanceModule(
      getTokenByChainAndSymbol(chainId, 'uSOL3x').symbol,
      chainId,
    )
    expect(issuanceModule.address).toEqual(expectedModule)
    expect(issuanceModule.isDebtIssuance).toBe(true)
  })

  test('returns debt issuance module v3 for uSUI2x on Base', async () => {
    const chainId = ChainId.Base
    const expectedModule = Contracts[chainId].DebtIssuanceModuleV3
    const issuanceModule = getIssuanceModule(
      getTokenByChainAndSymbol(chainId, 'uSUI2x').symbol,
      chainId,
    )
    expect(issuanceModule.address).toEqual(expectedModule)
    expect(issuanceModule.isDebtIssuance).toBe(true)
  })

  test('returns debt issuance module v3 for uSUI3x on Base', async () => {
    const chainId = ChainId.Base
    const expectedModule = Contracts[chainId].DebtIssuanceModuleV3
    const issuanceModule = getIssuanceModule(
      getTokenByChainAndSymbol(chainId, 'uSUI3x').symbol,
      chainId,
    )
    expect(issuanceModule.address).toEqual(expectedModule)
    expect(issuanceModule.isDebtIssuance).toBe(true)
  })

  test('returns debt issuance module v3 for wstETH15x on Base', async () => {
    const chainId = ChainId.Base
    const expectedModule = Contracts[chainId].DebtIssuanceModuleV3
    const issuanceModule = getIssuanceModule(
      getTokenByChainAndSymbol(chainId, 'wstETH15x').symbol,
      chainId,
    )
    expect(issuanceModule.address).toEqual(expectedModule)
    expect(issuanceModule.isDebtIssuance).toBe(true)
  })
})
