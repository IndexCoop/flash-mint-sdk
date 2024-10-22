import { Provider } from '@ethersproject/abstract-provider'
import { Signer } from '@ethersproject/abstract-signer'
import { Contract } from '@ethersproject/contracts'

import EXCHANGE_ISSUANCE_LEVERAGED_ABI from '../constants/abis/ExchangeIssuanceLeveraged.json'
import EXCHANGE_ISSUANCE_ZERO_EX_ABI from '../constants/abis/ExchangeIssuanceZeroEx.json'
import FLASHMINT_HYETH_ABI from '../constants/abis/FlashMintHyEth.json'
import FLASHMINT_LEVERAGED_COMPOUND from '../constants/abis/FlashMintLeveragedForCompound.json'
import FLASHMINT_LEVERAGED_EXTENDED_ABI from '../constants/abis/FlashMintLeveragedExtended.json'
import FLASHMINT_NAV_ABI from '../constants/abis/FlashMintNav.json'
import FLASHMINT_WRAPPED_ABI from '../constants/abis/FlashMintWrapped.json'
import FLASHMINT_ZEROEX_ABI from '../constants/abis/FlashMintZeroEx.json'

import { ChainId } from '../constants/chains'
import {
  Contracts,
  ExchangeIssuanceLeveragedMainnetAddress,
  ExchangeIssuanceLeveragedPolygonAddress,
  ExchangeIssuanceZeroExMainnetAddress,
  ExchangeIssuanceZeroExPolygonAddress,
  FlashMintLeveragedAddress,
  FlashMintLeveragedForCompoundAddress,
  FlashMintZeroExMainnetAddress,
} from '../constants/contracts'
import {
  BTC2xFlexibleLeverageIndex,
  ETH2xFlexibleLeverageIndex,
  DiversifiedStakedETHIndex,
  wsETH2,
  GitcoinStakedETHIndex,
  CoinDeskEthTrendIndex,
  IndexCoopEthereum2xIndex,
  IndexCoopBitcoin2xIndex,
  IndexCoopBitcoin3xIndex,
  IndexCoopEthereum3xIndex,
  IndexCoopInverseBitcoinIndex,
  IndexCoopInverseEthereumIndex,
  RealWorldAssetIndex,
} from '../constants/tokens'

export function getExchangeIssuanceLeveragedContractAddress(
  chainId: number = ChainId.Mainnet
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
  chainId: number = ChainId.Polygon
): Contract => {
  const contractAddress = getExchangeIssuanceLeveragedContractAddress(chainId)
  return new Contract(
    contractAddress,
    EXCHANGE_ISSUANCE_LEVERAGED_ABI,
    signerOrProvider
  )
}

/**
 * Returns an instance of a FlashMintHyEth contract.
 * Currently, only Mainnet is supported.
 */
export const getFlashMintHyEthContract = (
  signerOrProvider: Signer | Provider | undefined
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
  signerOrProvider: Signer | Provider | undefined
): Contract => {
  const contractAddress = FlashMintLeveragedAddress
  return new Contract(
    contractAddress,
    EXCHANGE_ISSUANCE_LEVERAGED_ABI,
    signerOrProvider
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
  chainId: ChainId
): Contract => {
  const contractAddress = Contracts[chainId].FlashMintLeveragedExtended
  return new Contract(
    contractAddress,
    FLASHMINT_LEVERAGED_EXTENDED_ABI,
    signerOrProvider
  )
}

/**
 * Returns an instance of a FlashMintLeveragedForCompound contract (mainnet only).
 * @param signerOrProvider  A signer or provider.
 * @returns An instance of a FlashMintLeveragedForCompound contract.
 */
export const getFlashMintLeveragedForCompoundContract = (
  signerOrProvider: Signer | Provider | undefined
): Contract => {
  return new Contract(
    FlashMintLeveragedForCompoundAddress,
    FLASHMINT_LEVERAGED_COMPOUND,
    signerOrProvider
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
  chainId: ChainId = ChainId.Polygon
): Contract => {
  if (chainId === ChainId.Arbitrum) {
    switch (token) {
      case IndexCoopBitcoin2xIndex.symbol:
      case IndexCoopEthereum2xIndex.symbol:
      case IndexCoopBitcoin3xIndex.symbol:
      case IndexCoopEthereum3xIndex.symbol:
      case IndexCoopInverseBitcoinIndex.symbol:
      case IndexCoopInverseEthereumIndex.symbol:
        return getIndexFlashMintLeveragedExtendedContract(
          signerOrProvider,
          chainId
        )
    }
    return getIndexFlashMintLeveragedContract(signerOrProvider)
  }
  if (chainId === ChainId.Base) {
    switch (token) {
      case IndexCoopEthereum2xIndex.symbol:
      case IndexCoopEthereum3xIndex.symbol:
        return getIndexFlashMintLeveragedExtendedContract(
          signerOrProvider,
          chainId
        )
    }
    return getIndexFlashMintLeveragedContract(signerOrProvider)
  }
  switch (token) {
    case BTC2xFlexibleLeverageIndex.symbol:
    case ETH2xFlexibleLeverageIndex.symbol:
      return getFlashMintLeveragedForCompoundContract(signerOrProvider)
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
  signerOrProvider: Signer | Provider | undefined
): Contract => {
  return new Contract(
    Contracts[ChainId.Mainnet].FlashMintNav,
    FLASHMINT_NAV_ABI,
    signerOrProvider
  )
}

/**
 * Returns an instance of a FlasthMintWrapped contract (mainnet only).
 * @param signerOrProvider A signer or provider.
 * @returns An instance of a FlasthMintWrapped contract.
 */
export const getFlashMintWrappedContract = (
  signerOrProvider: Signer | Provider | undefined
): Contract => {
  return new Contract(
    Contracts[ChainId.Mainnet].FlashMintWrapped,
    FLASHMINT_WRAPPED_ABI,
    signerOrProvider
  )
}

export function getExchangeIssuanceZeroExContractAddress(
  chainId: number = ChainId.Mainnet
): string {
  if (chainId === ChainId.Polygon) return ExchangeIssuanceZeroExPolygonAddress
  return ExchangeIssuanceZeroExMainnetAddress
}

/**
 * Returns an instance of a FlashMintZeroEx contract for Set Protocol (based on
 * the chain).
 *
 * @param providerSigner  provider or signer
 * @param chainId         chain ID for the network (default Mainnet)
 *
 * @returns an instance of a FlashMintZeroEx contract
 */
export const getFlashMintZeroExContract = (
  providerSigner: Signer | Provider | undefined,
  chainId: number = ChainId.Mainnet
): Contract => {
  const contractAddress = getExchangeIssuanceZeroExContractAddress(chainId)
  return new Contract(
    contractAddress,
    EXCHANGE_ISSUANCE_ZERO_EX_ABI,
    providerSigner
  )
}

/**
 * Returns the correct instance of a FlashMintZeroEx contract - depending on the
 * token. It will be either Index Protocol (new) or (Set Protocol)
 *
 * @param token           the token to be minted/redeemed
 * @param providerSigner  provider or signer
 * @param chainId         chain ID for the network (default Mainnet)
 *
 * @returns an instance of a FlashMintZeroEx contract
 */
export const getFlashMintZeroExContractForToken = (
  token: string,
  providerSigner: Signer | Provider | undefined,
  chainId: number = ChainId.Mainnet
): Contract => {
  switch (token) {
    case CoinDeskEthTrendIndex.symbol:
    case DiversifiedStakedETHIndex.symbol:
    case GitcoinStakedETHIndex.symbol:
    case RealWorldAssetIndex.symbol:
    case wsETH2.symbol:
      return new Contract(
        FlashMintZeroExMainnetAddress,
        FLASHMINT_ZEROEX_ABI,
        providerSigner
      )
    default:
      return getFlashMintZeroExContract(providerSigner, chainId)
  }
}
