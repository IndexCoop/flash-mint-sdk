import { BigNumber } from '@ethersproject/bignumber'
import { getTokenByChainAndSymbol } from '@indexcoop/tokenlists'

import { ChainId } from 'constants/chains'
import { Contracts } from 'constants/contracts'
import {
  BanklessBEDIndex,
  DefiPulseIndex,
  DiversifiedStakedETHIndex,
  IndexCoopBitcoin2xIndex,
  IndexCoopBitcoin3xIndex,
  IndexCoopEthereum2xIndex,
  IndexCoopEthereum3xIndex,
  IndexCoopInverseBitcoinIndex,
  IndexCoopInverseEthereumIndex,
  InterestCompoundingETHIndex,
  MetaverseIndex,
  TheUSDCYieldIndex,
} from 'constants/tokens'
import { QuoteTokens } from 'tests/utils'
import { wei } from 'utils'

import { FlashMintContractType, type FlashMintQuoteRequest } from './'
import { buildQuoteResponse, getContractType } from './utils'

const { usdc } = QuoteTokens
const icusd = getTokenByChainAndSymbol(ChainId.Base, 'icUSD')

describe('buildQuoteResponse()', () => {
  test('returns correct quote response object', async () => {
    const request: FlashMintQuoteRequest = {
      isMinting: true,
      inputToken: usdc,
      outputToken: icusd,
      indexTokenAmount: wei(1).toString(),
      slippage: 0.1,
    }
    const quoteAmount = wei(100, 6)
    const tx = {
      to: Contracts[ChainId.Mainnet].FlashMintWrapped,
      value: wei(1),
    }
    const response = buildQuoteResponse(
      request,
      1,
      FlashMintContractType.wrapped,
      quoteAmount,
      tx,
    )
    expect(response).toEqual({
      chainId: 1,
      contractType: FlashMintContractType.wrapped,
      contract: Contracts[ChainId.Mainnet].FlashMintWrapped,
      isMinting: true,
      inputToken: usdc,
      outputToken: icusd,
      inputAmount: quoteAmount,
      outputAmount: BigNumber.from(request.indexTokenAmount),
      indexTokenAmount: BigNumber.from(request.indexTokenAmount),
      inputOutputAmount: quoteAmount,
      slippage: 0.1,
      tx,
    })
  })
})

describe('getContractType()', () => {
  test('returns correct contract type for leveraged arbitrum tokens', async () => {
    const btc2xContractType = getContractType(
      IndexCoopBitcoin2xIndex.symbol,
      ChainId.Arbitrum,
    )
    const btc2xEthContractType = getContractType('BTC2xETH', ChainId.Arbitrum)
    const btc3xContractType = getContractType(
      IndexCoopBitcoin3xIndex.symbol,
      ChainId.Arbitrum,
    )
    const eth2xContractType = getContractType(
      IndexCoopEthereum2xIndex.symbol,
      ChainId.Arbitrum,
    )
    const eth2xBtcContractType = getContractType('ETH2xBTC', ChainId.Arbitrum)
    const eth3xContractType = getContractType(
      IndexCoopEthereum3xIndex.symbol,
      ChainId.Arbitrum,
    )
    const ibtc1xContractType = getContractType(
      IndexCoopInverseBitcoinIndex.symbol,
      ChainId.Arbitrum,
    )
    const ieth1xContractType = getContractType(
      IndexCoopInverseEthereumIndex.symbol,
      ChainId.Arbitrum,
    )
    expect(btc2xContractType).toBe(FlashMintContractType.leveragedExtended)
    expect(btc2xEthContractType).toBe(FlashMintContractType.leveragedExtended)
    expect(btc3xContractType).toBe(FlashMintContractType.leveragedExtended)
    expect(eth2xContractType).toBe(FlashMintContractType.leveragedExtended)
    expect(eth2xBtcContractType).toBe(FlashMintContractType.leveragedExtended)
    expect(eth3xContractType).toBe(FlashMintContractType.leveragedExtended)
    expect(ibtc1xContractType).toBe(FlashMintContractType.leveragedExtended)
    expect(ieth1xContractType).toBe(FlashMintContractType.leveragedExtended)
  })

  test('returns correct contract type for BED', async () => {
    const contractType = getContractType(
      BanklessBEDIndex.symbol,
      ChainId.Mainnet,
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
      ChainId.Mainnet,
    )
    expect(contractType).toBe(FlashMintContractType.zeroEx)
  })

  test('returns correct contract type for MVI', async () => {
    const contractType = getContractType(MetaverseIndex.symbol, ChainId.Mainnet)
    expect(contractType).toBe(FlashMintContractType.zeroEx)
  })

  test('returns correct contract type for BTC2X (mainnet)', async () => {
    const contractType = getContractType(
      IndexCoopBitcoin2xIndex.symbol,
      ChainId.Mainnet,
    )
    expect(contractType).toBe(FlashMintContractType.leveraged)
  })

  test('returns correct contract type for ETH2X (mainnet)', async () => {
    const contractType = getContractType(
      IndexCoopEthereum2xIndex.symbol,
      ChainId.Mainnet,
    )
    expect(contractType).toBe(FlashMintContractType.leveraged)
  })

  test('returns correct contract type for hyETH', async () => {
    const contractType = getContractType('hyETH', ChainId.Mainnet)
    expect(contractType).toBe(FlashMintContractType.hyeth)
  })

  test('returns correct contract type for icETH', async () => {
    const contractType = getContractType(
      InterestCompoundingETHIndex.symbol,
      ChainId.Mainnet,
    )
    expect(contractType).toBe(FlashMintContractType.leveraged)
  })

  test('returns correct contract type for icUSD', async () => {
    const contractType = getContractType(
      TheUSDCYieldIndex.symbol,
      ChainId.Mainnet,
    )
    expect(contractType).toBe(FlashMintContractType.wrapped)
  })
})
