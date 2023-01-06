import { Provider } from '@ethersproject/abstract-provider'
import { Signer } from '@ethersproject/abstract-signer'
import { Contract } from '@ethersproject/contracts'

import EXCHANGE_ISSUANCE_LEVERAGED_ABI from '../constants/abis/ExchangeIssuanceLeveraged.json'
import EXCHANGE_ISSUANCE_ZERO_EX_ABI from '../constants/abis/ExchangeIssuanceZeroEx.json'
import FLASHMINT_LEVERAGED_COMPOUND from '../constants/abis/FlashMintLeveragedForCompound.json'
import FLASHMINT_ZEROEX_ABI from '../constants/abis/FlashMintZeroEx.json'

import { ChainId } from '../constants/chains'
import {
  ExchangeIssuanceLeveragedMainnetAddress,
  ExchangeIssuanceLeveragedPolygonAddress,
  ExchangeIssuanceZeroExMainnetAddress,
  ExchangeIssuanceZeroExPolygonAddress,
  FlashMintLeveragedForCompoundAddress,
  FlashMintZeroExMainnetAddress,
} from '../constants/contracts'
import {
  BTC2xFlexibleLeverageIndex,
  ETH2xFlexibleLeverageIndex,
  EthereumDiversifiedStakingIndex,
  wsETH2,
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
  chainId: number = ChainId.Polygon
): Contract => {
  switch (token) {
    case BTC2xFlexibleLeverageIndex.symbol:
    case ETH2xFlexibleLeverageIndex.symbol:
      return getFlashMintLeveragedForCompoundContract(signerOrProvider)
    default:
      return getFlashMintLeveragedContract(signerOrProvider, chainId)
  }
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
    case EthereumDiversifiedStakingIndex.symbol:
    case wsETH2.symbol:
      return getIndexFlashMintZeroExContract(providerSigner, chainId)
    default:
      return getFlashMintZeroExContract(providerSigner, chainId)
  }
}

export function getIndexFlashMintZeroExContractAddress(
  chainId: number
): string {
  switch (chainId) {
    default:
      return FlashMintZeroExMainnetAddress
  }
}

/**
 * Returns an instance of an FlashMintZeroEx contract for Index Protocol (based
 * on the chain).
 *
 * @param providerSigner  A provider or signer
 * @param chainId         The chain ID for the network (default Mainnet)
 *
 * @returns An instance of a FlashMintZeroEx contract
 */
export const getIndexFlashMintZeroExContract = (
  providerSigner: Signer | Provider | undefined,
  chainId: number = ChainId.Mainnet
): Contract => {
  const contractAddress = getIndexFlashMintZeroExContractAddress(chainId)
  return new Contract(contractAddress, FLASHMINT_ZEROEX_ABI, providerSigner)
}
