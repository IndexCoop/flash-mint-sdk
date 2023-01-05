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
  BTC2xFlexibleLeverageIndex,
  ETH2xFlexibleLeverageIndex,
  ETH2xFlexibleLeverageIndexPolygon,
  EthereumDiversifiedStakingIndex,
  GMIIndex,
  InverseETHFlexibleLeverageIndex,
  InverseMATICFlexibleLeverageIndex,
  JPGIndex,
  MATIC2xFlexibleLeverageIndex,
  MetaverseIndex,
  wsETH2,
} from 'constants/tokens'

import { getIssuanceModule } from './issuanceModules'

describe('getIssuanceModule() - Mainnet', () => {
  test('returns basic issuance module for any other index', async () => {
    const expectedAddress = BasicIssuanceModuleAddress
    const issuanceModule = getIssuanceModule(MetaverseIndex.symbol)
    expect(issuanceModule.address).toEqual(expectedAddress)
    expect(issuanceModule.isDebtIssuance).toBe(false)
  })

  test('returns debt issuance module for relevant indexes', async () => {
    const expectedAddress = DebtIssuanceModuleAddress
    const issuanceModuleBtc2x = getIssuanceModule(
      BTC2xFlexibleLeverageIndex.symbol
    )
    const issuanceModuleEth2x = getIssuanceModule(
      ETH2xFlexibleLeverageIndex.symbol
    )
    const issuanceModuleGmi = getIssuanceModule(GMIIndex.symbol)
    expect(issuanceModuleBtc2x.address).toEqual(expectedAddress)
    expect(issuanceModuleBtc2x.isDebtIssuance).toBe(true)
    expect(issuanceModuleEth2x.address).toEqual(expectedAddress)
    expect(issuanceModuleEth2x.isDebtIssuance).toBe(true)
    expect(issuanceModuleGmi.address).toEqual(expectedAddress)
    expect(issuanceModuleGmi.isDebtIssuance).toBe(true)
  })

  test('returns debt issuance module v2 for JPG', async () => {
    const expectedAddress = DebtIssuanceModuleV2Address
    const issuanceModule = getIssuanceModule(JPGIndex.symbol)
    expect(issuanceModule.address).toEqual(expectedAddress)
    expect(issuanceModule.isDebtIssuance).toBe(true)
  })

  test('returns debt issuance module v2 for Index Protocol tokens', async () => {
    const expectedAddress = IndexDebtIssuanceModuleV2Address
    const issuanceModule = getIssuanceModule(
      EthereumDiversifiedStakingIndex.symbol
    )
    expect(issuanceModule.address).toEqual(expectedAddress)
    expect(issuanceModule.isDebtIssuance).toBe(true)
    const issuanceModul2 = getIssuanceModule(wsETH2.symbol)
    expect(issuanceModul2.address).toEqual(expectedAddress)
    expect(issuanceModul2.isDebtIssuance).toBe(true)
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
