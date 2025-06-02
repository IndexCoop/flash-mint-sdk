import { BigNumber } from '@ethersproject/bignumber'
import { getTokenByChainAndSymbol } from '@indexcoop/tokenlists'

import { ChainId } from 'constants/chains'
import { Contracts } from 'constants/contracts'
import { wei } from 'utils'

import { FlashMintContractType, type FlashMintQuoteRequest } from './'
import { buildQuoteResponse, getContractType } from './utils'

describe('buildQuoteResponse()', () => {
  test('returns correct quote response object', async () => {
    const usdc = getTokenByChainAndSymbol(ChainId.Base, 'USDC')
    const indexToken = getTokenByChainAndSymbol(ChainId.Base, 'wstETH15x')
    const request: FlashMintQuoteRequest = {
      chainId: ChainId.Base,
      isMinting: true,
      inputToken: usdc,
      outputToken: indexToken,
      indexTokenAmount: wei(1).toString(),
      inputTokenAmount: wei(1.5).toString(),
      slippage: 0.1,
    }
    const inputOutputTokenAmount = wei(99, 6)
    const quoteAmount = wei(100, 6)
    const tx = {
      to: Contracts[ChainId.Mainnet].FlashMintLeveragedZeroEx,
      value: wei(1),
    }
    const response = buildQuoteResponse(
      request,
      8453,
      FlashMintContractType.leveragedZeroEx,
      inputOutputTokenAmount,
      quoteAmount,
      tx,
    )
    expect(response).toEqual({
      chainId: 8453,
      contractType: FlashMintContractType.leveragedZeroEx,
      contract: Contracts[ChainId.Mainnet].FlashMintLeveragedZeroEx,
      isMinting: true,
      inputToken: usdc,
      outputToken: getTokenByChainAndSymbol(ChainId.Base, 'wstETH15x'),
      inputAmount: inputOutputTokenAmount,
      outputAmount: BigNumber.from(request.indexTokenAmount),
      indexTokenAmount: BigNumber.from(request.indexTokenAmount),
      inputOutputAmount: inputOutputTokenAmount,
      quoteAmount,
      slippage: 0.1,
      tx,
    })
  })
})

describe('getContractType()', () => {
  test('returns correct contract type for leveraged arbitrum tokens', async () => {
    const btc2xContractType = getContractType('BTC2X', ChainId.Arbitrum)
    const btc2xEthContractType = getContractType('BTC2xETH', ChainId.Arbitrum)
    const btc3xContractType = getContractType('BTC3X', ChainId.Arbitrum)
    const eth2xContractType = getContractType('ETH2X', ChainId.Arbitrum)
    const eth2xBtcContractType = getContractType('ETH2xBTC', ChainId.Arbitrum)
    const eth3xContractType = getContractType('ETH3X', ChainId.Arbitrum)
    const ibtc1xContractType = getContractType('iBTC1X', ChainId.Arbitrum)
    const ieth1xContractType = getContractType('iETH1X', ChainId.Arbitrum)
    expect(btc2xContractType).toBe(FlashMintContractType.static)
    expect(btc2xEthContractType).toBe(FlashMintContractType.static)
    expect(btc3xContractType).toBe(FlashMintContractType.static)
    expect(eth2xContractType).toBe(FlashMintContractType.static)
    expect(eth2xBtcContractType).toBe(FlashMintContractType.static)
    expect(eth3xContractType).toBe(FlashMintContractType.static)
    expect(ibtc1xContractType).toBe(FlashMintContractType.static)
    expect(ieth1xContractType).toBe(FlashMintContractType.static)
  })

  test('returns correct contract type for DPI', async () => {
    const contractType = getContractType('DPI', ChainId.Mainnet)
    expect(contractType).toBe(FlashMintContractType.zeroEx)
  })

  test('returns correct contract type for MVI', async () => {
    const contractType = getContractType('MVI', ChainId.Mainnet)
    expect(contractType).toBe(FlashMintContractType.zeroEx)
  })

  test('returns correct contract type for BTC2X (mainnet)', async () => {
    const contractType = getContractType('BTC2X', ChainId.Mainnet)
    expect(contractType).toBe(FlashMintContractType.static)
  })

  test('returns correct contract type for BTC2X (base)', async () => {
    const contractType = getContractType(
      getTokenByChainAndSymbol(ChainId.Base, 'BTC2X').symbol,
      ChainId.Base,
    )
    expect(contractType).toBe(FlashMintContractType.static)
  })

  test('returns correct contract type for BTC3X (base)', async () => {
    const contractType = getContractType(
      getTokenByChainAndSymbol(ChainId.Base, 'BTC3X').symbol,
      ChainId.Base,
    )
    expect(contractType).toBe(FlashMintContractType.static)
  })

  test('returns correct contract type for ETH2X (mainnet)', async () => {
    const contractType = getContractType('ETH2X', ChainId.Mainnet)
    expect(contractType).toBe(FlashMintContractType.static)
  })

  test('returns correct contract type for hyETH', async () => {
    const contractType = getContractType('hyETH', ChainId.Mainnet)
    expect(contractType).toBe(FlashMintContractType.hyeth)
  })

  test('returns correct contract type for icETH', async () => {
    const contractType = getContractType('icETH', ChainId.Mainnet)
    expect(contractType).toBe(FlashMintContractType.static)
  })

  test('returns correct contract type for uSUI2x', async () => {
    const contractType = getContractType(
      getTokenByChainAndSymbol(ChainId.Base, 'uSUI2x').symbol,
      ChainId.Base,
    )
    expect(contractType).toBe(FlashMintContractType.static)
  })

  test('returns correct contract type for uSUI3x', async () => {
    const contractType = getContractType(
      getTokenByChainAndSymbol(ChainId.Base, 'uSUI3x').symbol,
      ChainId.Base,
    )
    expect(contractType).toBe(FlashMintContractType.static)
  })

  test('returns correct contract type for uSOL2x', async () => {
    const contractType = getContractType(
      getTokenByChainAndSymbol(ChainId.Base, 'uSOL3x').symbol,
      ChainId.Base,
    )
    expect(contractType).toBe(FlashMintContractType.static)
  })

  test('returns correct contract type for uSOL3x', async () => {
    const contractType = getContractType(
      getTokenByChainAndSymbol(ChainId.Base, 'uSOL3x').symbol,
      ChainId.Base,
    )
    expect(contractType).toBe(FlashMintContractType.static)
  })

  test('returns correct contract type for wstEth15x', async () => {
    const contractType = getContractType(
      getTokenByChainAndSymbol(ChainId.Base, 'wstETH15x').symbol,
      ChainId.Base,
    )
    expect(contractType).toBe(FlashMintContractType.static)
  })
})
