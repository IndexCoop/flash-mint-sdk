import type { Provider } from '@ethersproject/abstract-provider'
import type { Signer } from '@ethersproject/abstract-signer'
import { Contract } from '@ethersproject/contracts'
import { getTokenByChainAndSymbol } from '@indexcoop/tokenlists'

import { FlashMintAbis } from 'utils/abis'
import EXCHANGE_ISSUANCE_LEVERAGED_ABI from '../constants/abis/ExchangeIssuanceLeveraged.json'
import EXCHANGE_ISSUANCE_ZERO_EX_ABI from '../constants/abis/ExchangeIssuanceZeroEx.json'
import FLASHMINT_HYETH_ABI from '../constants/abis/FlashMintHyEth.json'
import FLASHMINT_LEVERAGED_AERODROME_ABI from '../constants/abis/FlashMintLeveragedAerodrome.json'
import FLASHMINT_LEVERAGED_EXTENDED_ABI from '../constants/abis/FlashMintLeveragedExtended.json'
import FLASHMINT_LEVERAGED_COMPOUND from '../constants/abis/FlashMintLeveragedForCompound.json'
import FLASHMINT_LEVERAGED_MORPHO_AAVE_ABI from '../constants/abis/FlashMintLeveragedMorpho.json'
import FLASHMINT_LEVERAGED_MORPHO_AAVE_LM_ABI from '../constants/abis/FlashMintLeveragedMorphoAaveLM.json'
import FLASHMINT_NAV_ABI from '../constants/abis/FlashMintNav.json'
import FLASHMINT_WRAPPED_ABI from '../constants/abis/FlashMintWrapped.json'

import { ChainId } from '../constants/chains'
import {
  Contracts,
  ExchangeIssuanceLeveragedMainnetAddress,
  ExchangeIssuanceLeveragedPolygonAddress,
  FlashMintLeveragedAddress,
  FlashMintLeveragedForCompoundAddress,
} from '../constants/contracts'
import {
  IndexCoopBitcoin2xIndex,
  IndexCoopBitcoin3xIndex,
  IndexCoopEthereum2xIndex,
  IndexCoopEthereum3xIndex,
  IndexCoopInverseBitcoinIndex,
  IndexCoopInverseEthereumIndex,
} from '../constants/tokens'

import type { Address } from 'viem'

export function getExchangeIssuanceLeveragedContractAddress(
  chainId: number = ChainId.Mainnet,
): string {
  if (chainId === ChainId.Polygon)
    return ExchangeIssuanceLeveragedPolygonAddress
  return ExchangeIssuanceLeveragedMainnetAddress
}

/**
 * Returns an instance of a FlashMintLeveraged contract based on the chain.
 *
 * @param signerOrProvider  a signer or provider
 * @param chainId           chainId for contract (default Polygon since this where
 *                          the contract is mostly used)
 *
 * @returns an instance of a FlashMintLeveraged contract
 */
export const getFlashMintLeveragedContract = (
  signerOrProvider: Signer | Provider | undefined,
  chainId: number = ChainId.Polygon,
): Contract => {
  const contractAddress = getExchangeIssuanceLeveragedContractAddress(chainId)
  return new Contract(
    contractAddress,
    EXCHANGE_ISSUANCE_LEVERAGED_ABI,
    signerOrProvider,
  )
}

/**
 * Returns an instance of a FlashMintHyEth contract.
 * Currently, only Mainnet is supported.
 */
export const getFlashMintHyEthContract = (
  signerOrProvider: Signer | Provider | undefined,
): Contract => {
  const contractAddress = Contracts[ChainId.Mainnet].FlashMintHyEthV3
  return new Contract(contractAddress, FLASHMINT_HYETH_ABI, signerOrProvider)
}

/**
 * Returns an instance of the Index FlashMintLeveraged contract (mainnet)
 *
 * @param signerOrProvider  a signer or provider
 * @param chainId           chainId for contract (default mainnet)
 *
 * @returns an instance of a FlashMintLeveraged contract
 */
export const getIndexFlashMintLeveragedContract = (
  signerOrProvider: Signer | Provider | undefined,
): Contract => {
  const contractAddress = FlashMintLeveragedAddress
  return new Contract(
    contractAddress,
    EXCHANGE_ISSUANCE_LEVERAGED_ABI,
    signerOrProvider,
  )
}

/**
 * Returns an instance of the Index FlashMintLeveragedAerodrome contract (Base)
 *
 * @param signerOrProvider a signer or provider
 *
 * @returns an instance of a FlashMintLeveraged contract
 */
export const getIndexFlashMintLeveragedAerodromeContract = (
  signerOrProvider: Signer | Provider | undefined,
): Contract => {
  const contractAddress = Contracts[ChainId.Base].FlashMintLeveragedAerodrome
  return new Contract(
    contractAddress,
    FLASHMINT_LEVERAGED_AERODROME_ABI,
    signerOrProvider,
  )
}

/**
 * Returns an instance of the Index FlashMintLeveragedMorphoAaveLM contract (Base)
 *
 * @param signerOrProvider a signer or provider
 *
 * @returns an instance of a FlashMintLeveraged contract
 */
export const getIndexFlashMintLeveragedMorphoContract = (
  signerOrProvider: Signer | Provider | undefined,
): Contract => {
  const contractAddress = Contracts[ChainId.Base].FlashMintLeveragedMorpho
  return new Contract(
    contractAddress,
    FLASHMINT_LEVERAGED_MORPHO_AAVE_ABI,
    signerOrProvider,
  )
}

/**
 * Returns an instance of the Index FlashMintLeveragedMorphoAaveLM contract (Base)
 *
 * @param signerOrProvider a signer or provider
 *
 * @returns an instance of a FlashMintLeveraged contract
 */
export const getIndexFlashMintLeveragedMorphoAaveLMContract = (
  signerOrProvider: Signer | Provider | undefined,
): Contract => {
  const contractAddress = Contracts[ChainId.Base].FlashMintLeveragedMorphoAaveLM
  return new Contract(
    contractAddress,
    FLASHMINT_LEVERAGED_MORPHO_AAVE_LM_ABI,
    signerOrProvider,
  )
}
/**
 * Returns an instance of the Index FlashMintLeveragedExtended contract (Arbitrum + Base)
 *
 * @param signerOrProvider  a signer or provider
 * @params chainId Arbitrum or Base chainId
 *
 * @returns an instance of a FlashMintLeveraged contract
 */
export const getIndexFlashMintLeveragedExtendedContract = (
  signerOrProvider: Signer | Provider | undefined,
  chainId: ChainId,
): Contract => {
  const contractAddress = Contracts[chainId].FlashMintLeveragedExtended
  return new Contract(
    contractAddress,
    FLASHMINT_LEVERAGED_EXTENDED_ABI,
    signerOrProvider,
  )
}

/**
 * Returns an instance of a FlashMintLeveragedForCompound contract (mainnet only).
 * @param signerOrProvider  A signer or provider.
 * @returns An instance of a FlashMintLeveragedForCompound contract.
 */
export const getFlashMintLeveragedForCompoundContract = (
  signerOrProvider: Signer | Provider | undefined,
): Contract => {
  return new Contract(
    FlashMintLeveragedForCompoundAddress,
    FLASHMINT_LEVERAGED_COMPOUND,
    signerOrProvider,
  )
}

/**
 * Returns an instance of a FlashMintLeveraged contract based on the token. This
 * could be new contract on Index Protocol or old contracts on Set Protocol.
 *
 * @param token             a token to mint/redeem
 * @param signerOrProvider  a signer or provider
 * @param chainId           chainId for contract (default Polygon since this where
 *                          the contract is mostly used)
 *
 * @returns an instance of a FlashMintLeveraged contract
 */
export const getFlashMintLeveragedContractForToken = (
  token: string,
  signerOrProvider: Signer | Provider | undefined,
  chainId: ChainId = ChainId.Polygon,
): Contract => {
  if (chainId === ChainId.Arbitrum) {
    const btc2xEth = getTokenByChainAndSymbol(ChainId.Arbitrum, 'BTC2xETH')
    const eth2xBtc = getTokenByChainAndSymbol(ChainId.Arbitrum, 'ETH2xBTC')
    switch (token) {
      case btc2xEth.symbol:
      case eth2xBtc.symbol:
      case IndexCoopBitcoin2xIndex.symbol:
      case IndexCoopEthereum2xIndex.symbol:
      case IndexCoopBitcoin3xIndex.symbol:
      case IndexCoopEthereum3xIndex.symbol:
      case IndexCoopInverseBitcoinIndex.symbol:
      case IndexCoopInverseEthereumIndex.symbol:
        return getIndexFlashMintLeveragedExtendedContract(
          signerOrProvider,
          chainId,
        )
    }
    return getIndexFlashMintLeveragedContract(signerOrProvider)
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
        return getIndexFlashMintLeveragedMorphoAaveLMContract(signerOrProvider)
      case IndexCoopEthereum2xIndex.symbol:
      case IndexCoopEthereum3xIndex.symbol:
        return getIndexFlashMintLeveragedExtendedContract(
          signerOrProvider,
          chainId,
        )
      case uSol2x.symbol:
      case uSol3x.symbol:
      case uSui2x.symbol:
      case uSui3x.symbol:
      case wstEth15x.symbol:
        return getIndexFlashMintLeveragedMorphoContract(signerOrProvider)
    }
    return getIndexFlashMintLeveragedContract(signerOrProvider)
  }
  switch (token) {
    case IndexCoopBitcoin2xIndex.symbol:
    case IndexCoopEthereum2xIndex.symbol:
      return getIndexFlashMintLeveragedContract(signerOrProvider)
    default:
      return getFlashMintLeveragedContract(signerOrProvider, chainId)
  }
}

/**
 * Returns an instance of a FlashMintNav contract (mainnet only).
 * @param signerOrProvider A signer or provider.
 * @returns An instance of a FlashMintNav contract.
 */
export const getFlashMintNavContract = (
  signerOrProvider: Signer | Provider | undefined,
): Contract => {
  return new Contract(
    Contracts[ChainId.Mainnet].FlashMintNav,
    FLASHMINT_NAV_ABI,
    signerOrProvider,
  )
}

/**
 * Returns an instance of a FlasthMintWrapped contract.
 * @param signerOrProvider A signer or provider.
 * @param chainId A supported chainId.
 * @returns An instance of a FlasthMintWrapped contract.
 */
export const getFlashMintWrappedContract = (
  signerOrProvider: Signer | Provider | undefined,
  chainId: number = ChainId.Mainnet,
): Contract => {
  const contractAddress = Contracts[chainId].FlashMintWrapped
  return new Contract(contractAddress, FLASHMINT_WRAPPED_ABI, signerOrProvider)
}

/**
 * Returns an instance of a FlashMintZeroEx contract.
 *
 * @param providerSigner A provider or signer.
 * @returns An instance of a FlashMintZeroEx contract.
 */
export const getFlashMintZeroExContract = (
  providerSigner: Signer | Provider | undefined,
): Contract => {
  const contractAddress = Contracts[ChainId.Mainnet].ExchangeIssuanceZeroEx
  return new Contract(
    contractAddress,
    EXCHANGE_ISSUANCE_ZERO_EX_ABI,
    providerSigner,
  )
}

/**
 * Returns the FlashMintZeroEx contract based on the token.
 *
 * @param token The token to be minted/redeemed.
 * @param providerSigner A provider or signer.
 * @returns An instance of a FlashMintZeroEx contract.
 */
export const getFlashMintZeroExContractForToken = (
  token: string,
  providerSigner: Signer | Provider | undefined,
): Contract => {
  switch (token) {
    default:
      return getFlashMintZeroExContract(providerSigner)
  }
}

export function getFlashMintContract(
  contract: Address,
  providerSigner: Signer | Provider | undefined,
): Contract {
  const abi = FlashMintAbis[contract]
  return new Contract(contract, abi, providerSigner)
}
