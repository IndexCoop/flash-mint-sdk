import { ChainId } from 'constants/chains'
import {
  BanklessBEDIndex,
  BTC2xFlexibleLeverageIndex,
  DefiPulseIndex,
  DiversifiedStakedETHIndex,
  ETH2xFlexibleLeverageIndex,
  GitcoinStakedETHIndex,
  HighYieldETHIndex,
  IndexCoopBitcoin2xIndex,
  IndexCoopBitcoin3xIndex,
  IndexCoopEthereum2xIndex,
  IndexCoopEthereum3xIndex,
  IndexCoopInverseBitcoinIndex,
  IndexCoopInverseEthereumIndex,
  InterestCompoundingETHIndex,
  MetaverseIndex,
} from 'constants/tokens'

import { FlashMintContractType } from './'
import { getContractType } from './utils'

describe('getContractType()', () => {
  test('returns correct contract type for leveraged arbitrum tokens', async () => {
    const btc2xContractType = getContractType(
      IndexCoopBitcoin2xIndex.symbol,
      ChainId.Arbitrum
    )
    const btc3xContractType = getContractType(
      IndexCoopBitcoin3xIndex.symbol,
      ChainId.Arbitrum
    )
    const eth2xContractType = getContractType(
      IndexCoopEthereum2xIndex.symbol,
      ChainId.Arbitrum
    )
    const eth3xContractType = getContractType(
      IndexCoopEthereum3xIndex.symbol,
      ChainId.Arbitrum
    )
    const ibtc1xContractType = getContractType(
      IndexCoopInverseBitcoinIndex.symbol,
      ChainId.Arbitrum
    )
    const ieth1xContractType = getContractType(
      IndexCoopInverseEthereumIndex.symbol,
      ChainId.Arbitrum
    )
    expect(btc2xContractType).toBe(FlashMintContractType.leveragedExtended)
    expect(btc3xContractType).toBe(FlashMintContractType.leveragedExtended)
    expect(eth2xContractType).toBe(FlashMintContractType.leveragedExtended)
    expect(eth3xContractType).toBe(FlashMintContractType.leveragedExtended)
    expect(ibtc1xContractType).toBe(FlashMintContractType.leveragedExtended)
    expect(ieth1xContractType).toBe(FlashMintContractType.leveragedExtended)
  })

  test('returns correct contract type for BED', async () => {
    const contractType = getContractType(
      BanklessBEDIndex.symbol,
      ChainId.Mainnet
    )
    expect(contractType).toBe(FlashMintContractType.zeroEx)
  })

  test('returns correct contract type for DPI', async () => {
    const contractType = getContractType(DefiPulseIndex.symbol, ChainId.Mainnet)
    expect(contractType).toBe(FlashMintContractType.zeroEx)
  })

  test('returns correct contract type for dsETH', async () => {
    const contractType = getContractType(
      DiversifiedStakedETHIndex.symbol,
      ChainId.Mainnet
    )
    expect(contractType).toBe(FlashMintContractType.zeroEx)
  })

  test('returns correct contract type for gtcETH', async () => {
    const contractType = getContractType(
      GitcoinStakedETHIndex.symbol,
      ChainId.Mainnet
    )
    expect(contractType).toBe(FlashMintContractType.zeroEx)
  })

  test('returns correct contract type for MVI', async () => {
    const contractType = getContractType(MetaverseIndex.symbol, ChainId.Mainnet)
    expect(contractType).toBe(FlashMintContractType.zeroEx)
  })

  test('returns correct contract type for BTC2x-FLI', async () => {
    const contractType = getContractType(
      BTC2xFlexibleLeverageIndex.symbol,
      ChainId.Mainnet
    )
    expect(contractType).toBe(FlashMintContractType.leveraged)
  })

  test('returns correct contract type for ETH2x-FLI', async () => {
    const contractType = getContractType(
      ETH2xFlexibleLeverageIndex.symbol,
      ChainId.Mainnet
    )
    expect(contractType).toBe(FlashMintContractType.leveraged)
  })

  test('returns correct contract type for BTC2X (mainnet)', async () => {
    const contractType = getContractType(
      IndexCoopBitcoin2xIndex.symbol,
      ChainId.Mainnet
    )
    expect(contractType).toBe(FlashMintContractType.leveraged)
  })

  test('returns correct contract type for ETH2X (mainnet)', async () => {
    const contractType = getContractType(
      IndexCoopEthereum2xIndex.symbol,
      ChainId.Mainnet
    )
    expect(contractType).toBe(FlashMintContractType.leveraged)
  })

  test('returns correct contract type for hyETH', async () => {
    const contractType = getContractType(
      HighYieldETHIndex.symbol,
      ChainId.Mainnet
    )
    expect(contractType).toBe(FlashMintContractType.hyeth)
  })

  test('returns correct contract type for icETH', async () => {
    const contractType = getContractType(
      InterestCompoundingETHIndex.symbol,
      ChainId.Mainnet
    )
    expect(contractType).toBe(FlashMintContractType.leveraged)
  })
})
