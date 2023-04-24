import { ChainId } from 'constants/chains'
import {
  BasicIssuanceModuleAddress,
  BasicIssuanceModulePolygonAddress,
  DebtIssuanceModuleAddress,
  DebtIssuanceModuleV2Address,
  DebtIssuanceModuleV2PolygonAddress,
  IndexDebtIssuanceModuleV2Address,
} from 'constants/contracts'
import {
  BanklessBEDIndex,
  BTC2xFlexibleLeverageIndex,
  DefiPulseIndex,
  ETH2xFlexibleLeverageIndex,
  ETH2xFlexibleLeverageIndexPolygon,
  DiversifiedStakedETHIndex,
  GitcoinStakedETHIndex,
  GMIIndex,
  InterestCompoundingETHIndex,
  InverseETHFlexibleLeverageIndex,
  InverseMATICFlexibleLeverageIndex,
  JPGIndex,
  MATIC2xFlexibleLeverageIndex,
  MetaverseIndex,
  MoneyMarketIndexToken,
  wsETH2,
} from 'constants/tokens'

import { getIssuanceModule } from './issuanceModules'

describe('getIssuanceModule() - Mainnet - IndexProtocol', () => {
  test('returns debt issuance module v2 for dsETH', async () => {
    const expectedModule = IndexDebtIssuanceModuleV2Address
    const issuanceModule = getIssuanceModule(DiversifiedStakedETHIndex.symbol)
    expect(issuanceModule.address).toEqual(expectedModule)
    expect(issuanceModule.isDebtIssuance).toBe(true)
  })

  test('returns debt issuance module v2 for gtcETH', async () => {
    const expectedModule = IndexDebtIssuanceModuleV2Address
    const issuanceModule = getIssuanceModule(GitcoinStakedETHIndex.symbol)
    expect(issuanceModule.address).toEqual(expectedModule)
    expect(issuanceModule.isDebtIssuance).toBe(true)
  })

  test('returns debt issuance module v2 for MMI', async () => {
    const expectedModule = IndexDebtIssuanceModuleV2Address
    const issuanceModule = getIssuanceModule(MoneyMarketIndexToken.symbol)
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

  test('returns debt issuance module for GMI', async () => {
    const expectedModule = DebtIssuanceModuleAddress
    const issuanceModule = getIssuanceModule(GMIIndex.symbol)
    expect(issuanceModule.address).toEqual(expectedModule)
    expect(issuanceModule.isDebtIssuance).toBe(true)
  })

  test('returns debt issuance module v2 for icETH', async () => {
    const expectedModule = DebtIssuanceModuleV2Address
    const issuanceModule = getIssuanceModule(InterestCompoundingETHIndex.symbol)
    expect(issuanceModule.address).toEqual(expectedModule)
    expect(issuanceModule.isDebtIssuance).toBe(true)
  })

  test('returns debt issuance module v2 for JPG', async () => {
    const expectedAddress = DebtIssuanceModuleV2Address
    const issuanceModule = getIssuanceModule(JPGIndex.symbol)
    expect(issuanceModule.address).toEqual(expectedAddress)
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

  test('returns debt issuance module v2 for relevant indexes', async () => {
    const chainId = ChainId.Polygon
    const expectedAddress = DebtIssuanceModuleV2PolygonAddress
    const issuanceModuleEth2x = getIssuanceModule(
      ETH2xFlexibleLeverageIndexPolygon.symbol,
      chainId
    )
    const issuanceModuleGmi = getIssuanceModule(GMIIndex.symbol, chainId)
    const issuanceModuleInverseEth = getIssuanceModule(
      InverseETHFlexibleLeverageIndex.symbol,
      chainId
    )
    const issuanceModuleInverseMatic = getIssuanceModule(
      InverseMATICFlexibleLeverageIndex.symbol,
      chainId
    )
    const issuanceModuleMatic2x = getIssuanceModule(
      MATIC2xFlexibleLeverageIndex.symbol,
      chainId
    )
    expect(issuanceModuleEth2x.address).toEqual(expectedAddress)
    expect(issuanceModuleEth2x.isDebtIssuance).toBe(true)
    expect(issuanceModuleGmi.address).toEqual(expectedAddress)
    expect(issuanceModuleGmi.isDebtIssuance).toBe(true)
    expect(issuanceModuleInverseEth.address).toEqual(expectedAddress)
    expect(issuanceModuleInverseEth.isDebtIssuance).toBe(true)
    expect(issuanceModuleInverseMatic.address).toEqual(expectedAddress)
    expect(issuanceModuleInverseMatic.isDebtIssuance).toBe(true)
    expect(issuanceModuleMatic2x.address).toEqual(expectedAddress)
    expect(issuanceModuleMatic2x.isDebtIssuance).toBe(true)
  })
})
