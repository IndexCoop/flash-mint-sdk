import { ChainId } from 'constants/chains'
import {
  BasicIssuanceModuleAddress,
  BasicIssuanceModulePolygonAddress,
  DebtIssuanceModuleAddress,
  DebtIssuanceModuleV2Address,
  IndexDebtIssuanceModuleV2Address,
  IndexDebtIssuanceModuleV2Address_v2,
} from 'constants/contracts'
import {
  BanklessBEDIndex,
  BTC2xFlexibleLeverageIndex,
  DefiPulseIndex,
  ETH2xFlexibleLeverageIndex,
  DiversifiedStakedETHIndex,
  GitcoinStakedETHIndex,
  InterestCompoundingETHIndex,
  MetaverseIndex,
  wsETH2,
  LeveragedrEthStakingYield,
  CoinDeskEthTrendIndex,
  IndexCoopEthereum2xIndex,
  IndexCoopBitcoin2xIndex,
} from 'constants/tokens'

import { getIssuanceModule } from './issuanceModules'

describe('getIssuanceModule() - Mainnet - IndexProtocol', () => {
  test('returns debt issuance module v2 for BTC2X', async () => {
    const expectedModule = IndexDebtIssuanceModuleV2Address_v2
    const issuanceModule = getIssuanceModule(IndexCoopBitcoin2xIndex.symbol)
    expect(issuanceModule.address).toEqual(expectedModule)
    expect(issuanceModule.isDebtIssuance).toBe(true)
  })

  test('returns debt issuance module v2 for cdETI', async () => {
    const expectedModule = IndexDebtIssuanceModuleV2Address_v2
    const issuanceModule = getIssuanceModule(CoinDeskEthTrendIndex.symbol)
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

  test('returns debt issuance module v2 for gtcETH', async () => {
    const expectedModule = IndexDebtIssuanceModuleV2Address_v2
    const issuanceModule = getIssuanceModule(GitcoinStakedETHIndex.symbol)
    expect(issuanceModule.address).toEqual(expectedModule)
    expect(issuanceModule.isDebtIssuance).toBe(true)
  })

  test('returns debt issuance module v2 for icRETH', async () => {
    const expectedModule = IndexDebtIssuanceModuleV2Address_v2
    const issuanceModule = getIssuanceModule(LeveragedrEthStakingYield.symbol)
    expect(issuanceModule.address).toEqual(expectedModule)
    expect(issuanceModule.isDebtIssuance).toBe(true)
  })

  test('returns debt issuance module v2 for wsETH2', async () => {
    const expectedModule = IndexDebtIssuanceModuleV2Address
    const issuanceModule = getIssuanceModule(wsETH2.symbol)
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

  test('returns debt issuance module for BTC2XFLI', async () => {
    const expectedModule = DebtIssuanceModuleAddress
    const issuanceModule = getIssuanceModule(BTC2xFlexibleLeverageIndex.symbol)
    expect(issuanceModule.address).toEqual(expectedModule)
    expect(issuanceModule.isDebtIssuance).toBe(true)
  })

  test('returns debt issuance module for ETH2xFLI', async () => {
    const expectedModule = DebtIssuanceModuleAddress
    const issuanceModule = getIssuanceModule(ETH2xFlexibleLeverageIndex.symbol)
    expect(issuanceModule.address).toEqual(expectedModule)
    expect(issuanceModule.isDebtIssuance).toBe(true)
  })

  test('returns debt issuance module v2 for icETH', async () => {
    const expectedModule = DebtIssuanceModuleV2Address
    const issuanceModule = getIssuanceModule(InterestCompoundingETHIndex.symbol)
    expect(issuanceModule.address).toEqual(expectedModule)
    expect(issuanceModule.isDebtIssuance).toBe(true)
  })
})

describe('getIssuanceModule() - Polygon', () => {
  test('returns basic issuance module for any other index', async () => {
    const expectedAddress = BasicIssuanceModulePolygonAddress
    const issuanceModule = getIssuanceModule(
      MetaverseIndex.symbol,
      ChainId.Polygon
    )
    expect(issuanceModule.address).toEqual(expectedAddress)
    expect(issuanceModule.isDebtIssuance).toBe(false)
  })
})
