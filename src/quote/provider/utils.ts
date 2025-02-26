import type { TransactionRequest } from '@ethersproject/abstract-provider'
import { BigNumber } from '@ethersproject/bignumber'
import { getTokenByChainAndSymbol } from '@indexcoop/tokenlists'

import { ChainId } from 'constants/chains'
import {
  CoinDeskEthTrendIndex,
  DefiPulseIndex,
  HighYieldETHIndex,
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

import {
  FlashMintContractType,
  type FlashMintQuote,
  type FlashMintQuoteRequest,
} from './index'

export function buildQuoteResponse(
  request: FlashMintQuoteRequest,
  chainId: number,
  contractType: FlashMintContractType,
  inputOutputTokenAmount: BigNumber, // quote amount
  tx: TransactionRequest,
): FlashMintQuote {
  const { isMinting, inputToken, outputToken, slippage } = request
  const indexTokenAmount = BigNumber.from(request.indexTokenAmount)
  return {
    chainId,
    contractType,
    /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
    contract: tx.to!,
    isMinting,
    inputToken,
    outputToken,
    inputAmount: isMinting ? inputOutputTokenAmount : indexTokenAmount,
    outputAmount: isMinting ? indexTokenAmount : inputOutputTokenAmount,
    indexTokenAmount,
    inputOutputAmount: inputOutputTokenAmount,
    slippage,
    tx,
  }
}

// Returns contract type for token or null if not supported
export function getContractType(
  token: string,
  chainId: number,
): FlashMintContractType | null {
  if (chainId === ChainId.Arbitrum) {
    const btc2xEth = getTokenByChainAndSymbol(ChainId.Arbitrum, 'BTC2xETH')
    const eth2xBtc = getTokenByChainAndSymbol(ChainId.Arbitrum, 'ETH2xBTC')
    switch (token) {
      case btc2xEth.symbol:
      case eth2xBtc.symbol:
      case IndexCoopBitcoin2xIndex.symbol:
      case IndexCoopBitcoin3xIndex.symbol:
      case IndexCoopEthereum2xIndex.symbol:
      case IndexCoopEthereum3xIndex.symbol:
      case IndexCoopInverseBitcoinIndex.symbol:
      case IndexCoopInverseEthereumIndex.symbol:
        return FlashMintContractType.leveragedExtended
    }
  }
  if (chainId === ChainId.Base) {
    const btc2x = getTokenByChainAndSymbol(ChainId.Base, 'BTC2X')
    const btc3x = getTokenByChainAndSymbol(ChainId.Base, 'BTC3X')
    const uSol2x = getTokenByChainAndSymbol(ChainId.Base, 'uSOL2x')
    const uSol3x = getTokenByChainAndSymbol(ChainId.Base, 'uSOL3x')
    const uSui2x = getTokenByChainAndSymbol(ChainId.Base, 'uSUI2x')
    const uSui3x = getTokenByChainAndSymbol(ChainId.Base, 'uSUI3x')
    const wstEth15x = getTokenByChainAndSymbol(ChainId.Base, 'wstETH15x')
    switch (token) {
      case btc2x.symbol:
      case btc3x.symbol:
        return FlashMintContractType.leveragedMorphoAaveLM
      case IndexCoopEthereum2xIndex.symbol:
      case IndexCoopEthereum3xIndex.symbol:
        return FlashMintContractType.leveragedExtended
      case uSol2x.symbol:
      case uSol3x.symbol:
      case uSui2x.symbol:
      case uSui3x.symbol:
      case wstEth15x.symbol:
        return FlashMintContractType.leveragedMorpho
    }
  }
  if (token === HighYieldETHIndex.symbol) {
    return FlashMintContractType.hyeth
  }
  if (token === TheUSDCYieldIndex.symbol) {
    return FlashMintContractType.wrapped
  }
  if (
    token === CoinDeskEthTrendIndex.symbol ||
    token === DefiPulseIndex.symbol ||
    token === MetaverseIndex.symbol
  )
    return FlashMintContractType.zeroEx
  if (
    token === IndexCoopBitcoin2xIndex.symbol ||
    token === IndexCoopEthereum2xIndex.symbol ||
    token === InterestCompoundingETHIndex.symbol
  )
    return FlashMintContractType.leveraged
  return null
}
