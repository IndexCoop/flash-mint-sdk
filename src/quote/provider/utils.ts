import type { TransactionRequest } from '@ethersproject/abstract-provider'
import { BigNumber } from '@ethersproject/bignumber'
import { type Symbol_, getTokenByChainAndSymbol } from '@indexcoop/tokenlists'

import { ChainId } from 'constants/chains'

import {
  FlashMintContractType,
  type FlashMintQuote,
  type FlashMintQuoteRequest,
} from './index'

const btc2x = getTokenByChainAndSymbol(ChainId.Mainnet, 'BTC2X')
const btc3x = getTokenByChainAndSymbol(ChainId.Mainnet, 'BTC3x')
const dpi = getTokenByChainAndSymbol(ChainId.Mainnet, 'DPI')
const eth2x = getTokenByChainAndSymbol(ChainId.Mainnet, 'ETH2X')
const eth3x = getTokenByChainAndSymbol(ChainId.Mainnet, 'ETH3x')
const mvi = getTokenByChainAndSymbol(ChainId.Mainnet, 'MVI')
const hyeth = getTokenByChainAndSymbol(ChainId.Mainnet, 'hyETH')
const iceth = getTokenByChainAndSymbol(ChainId.Mainnet, 'icETH')

export function buildQuoteResponse(
  request: FlashMintQuoteRequest,
  chainId: number,
  contractType: FlashMintContractType,
  inputOutputTokenAmount: BigNumber, // quote amount
  quoteAmount: BigNumber, // no slippage
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
    quoteAmount,
    slippage,
    tx,
  }
}

/**
 * Determines the contract type for a given token and chain ID.
 *
 * @param token - The symbol of the token to check.
 * @param chainId - The ID of the network.
 * @returns The contract type for the token, or `null` if the token is not supported.
 */
export function getContractType(
  token: string,
  chainId: number,
): FlashMintContractType | null {
  if (chainId === ChainId.Arbitrum || chainId === ChainId.Base) {
    return FlashMintContractType.static
  }

  if (
    (
      [
        btc2x.symbol,
        eth2x.symbol,
        btc3x.symbol,
        eth3x.symbol,
        iceth.symbol,
      ] as Symbol_[]
    ).includes(token as Symbol_)
  ) {
    return FlashMintContractType.static
  }

  if (token === hyeth.symbol) {
    return FlashMintContractType.hyeth
  }

  if (token === dpi.symbol || token === mvi.symbol) {
    return FlashMintContractType.zeroEx
  }

  return null
}
