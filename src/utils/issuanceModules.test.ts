import { getTokenByChainAndSymbol } from '@indexcoop/tokenlists'

import { ChainId } from 'constants/chains'
import {
  BasicIssuanceModuleAddress,
  BasicIssuanceModulePolygonAddress,
  Contracts,
  DebtIssuanceModuleV2Address,
  IndexDebtIssuanceModuleV2Address,
  IndexDebtIssuanceModuleV2Address_v2,
} from 'constants/contracts'
import {
  BanklessBEDIndex,
  DefiPulseIndex,
  DiversifiedStakedETHIndex,
  IndexCoopBitcoin2xIndex,
  IndexCoopBitcoin3xIndex,
  IndexCoopEthereum2xIndex,
  InterestCompoundingETHIndex,
  MetaverseIndex,
  TheUSDCYieldIndex,
} from 'constants/tokens'

import { getIssuanceModule } from './issuanceModules'

describe('getIssuanceModule() - Mainnet - IndexProtocol', () => {
  test('returns debt issuance module v2 for BTC2X', async () => {
    const expectedModule = IndexDebtIssuanceModuleV2Address_v2
    const issuanceModule = getIssuanceModule(IndexCoopBitcoin2xIndex.symbol)
    expect(issuanceModule.address).toEqual(expectedModule)
    expect(issuanceModule.isDebtIssuance).toBe(true)
  })

  test('returns debt issuance module v2 for BTC2xETH', () => {
    const expectedModule = Contracts[ChainId.Arbitrum].DebtIssuanceModuleV3
    const issuanceModule = getIssuanceModule('BTC2xETH', ChainId.Arbitrum)
    expect(issuanceModule.address).toEqual(expectedModule)
    expect(issuanceModule.isDebtIssuance).toBe(true)
  })

  test('returns debt issuance module v2 for dsETH', async () => {
    const expectedModule = IndexDebtIssuanceModuleV2Address_v2
    const issuanceModule = getIssuanceModule(DiversifiedStakedETHIndex.symbol)
    expect(issuanceModule.address).toEqual(expectedModule)
    expect(issuanceModule.isDebtIssuance).toBe(true)
  })

  test('returns debt issuance module v2 for ETH2X', async () => {
    const expectedModule = IndexDebtIssuanceModuleV2Address_v2
    const issuanceModule = getIssuanceModule(IndexCoopEthereum2xIndex.symbol)
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

  test('returns debt issuance module v2 for icUSD', () => {
    const expectedModule = Contracts[ChainId.Mainnet].DebtIssuanceModuleV3
    const issuanceModule = getIssuanceModule(TheUSDCYieldIndex.symbol)
    expect(issuanceModule.address).toEqual(expectedModule)
    expect(issuanceModule.isDebtIssuance).toBe(true)
  })

  test('returns debt issuance module v2 for wsETH2', async () => {
    const expectedModule = IndexDebtIssuanceModuleV2Address
    const issuanceModule = getIssuanceModule('wsETH2')
    expect(issuanceModule.address).toEqual(expectedModule)
    expect(issuanceModule.isDebtIssuance).toBe(true)
  })
})

describe('getIssuanceModule() - Mainnet - SetProtocol', () => {
  test('returns basic issuance module for BED', async () => {
    const expectedModule = BasicIssuanceModuleAddress
    const issuanceModule = getIssuanceModule(BanklessBEDIndex.symbol)
    expect(issuanceModule.address).toEqual(expectedModule)
    expect(issuanceModule.isDebtIssuance).toBe(false)
  })

  test('returns basic issuance module for DPI', async () => {
    const expectedModule = BasicIssuanceModuleAddress
    const issuanceModule = getIssuanceModule(DefiPulseIndex.symbol)
    expect(issuanceModule.address).toEqual(expectedModule)
    expect(issuanceModule.isDebtIssuance).toBe(false)
  })

  test('returns basic issuance module for MVI', async () => {
    const expectedModule = BasicIssuanceModuleAddress
    const issuanceModule = getIssuanceModule(MetaverseIndex.symbol)
    expect(issuanceModule.address).toEqual(expectedModule)
    expect(issuanceModule.isDebtIssuance).toBe(false)
  })

  test('returns debt issuance module v2 for icETH', async () => {
    const expectedModule = DebtIssuanceModuleV2Address
    const issuanceModule = getIssuanceModule(InterestCompoundingETHIndex.symbol)
    expect(issuanceModule.address).toEqual(expectedModule)
    expect(issuanceModule.isDebtIssuance).toBe(true)
  })
})

describe('getIssuanceModule() - Arbitrum', () => {
  test('returns debt issuance module v3 for BTC2X on Arbitrum', async () => {
    const expectedModule = Contracts[ChainId.Arbitrum].DebtIssuanceModuleV3
    const issuanceModule = getIssuanceModule(
      IndexCoopBitcoin2xIndex.symbol,
      ChainId.Arbitrum,
    )
    expect(issuanceModule.address).toEqual(expectedModule)
    expect(issuanceModule.isDebtIssuance).toBe(true)
  })

  test('returns debt issuance module v3 for BTC3X', async () => {
    const expectedModule = Contracts[ChainId.Arbitrum].DebtIssuanceModuleV3
    const issuanceModule = getIssuanceModule(
      IndexCoopBitcoin3xIndex.symbol,
      ChainId.Arbitrum,
    )
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
})

describe('getIssuanceModule() - Polygon', () => {
  test('returns basic issuance module for any other index', async () => {
    const expectedAddress = BasicIssuanceModulePolygonAddress
    const issuanceModule = getIssuanceModule(
      MetaverseIndex.symbol,
      ChainId.Polygon,
    )
    expect(issuanceModule.address).toEqual(expectedAddress)
    expect(issuanceModule.isDebtIssuance).toBe(false)
  })
})
