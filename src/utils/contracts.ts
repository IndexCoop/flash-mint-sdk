import { Contract } from '@ethersproject/contracts'

import { FlashMintAbis } from 'utils/abis'
import EXCHANGE_ISSUANCE_ZERO_EX_ABI from '../constants/abis/ExchangeIssuanceZeroEx.json'
import FLASHMINT_HYETH_ABI from '../constants/abis/FlashMintHyEth.json'

import { ChainId } from '../constants/chains'
import { Contracts } from '../constants/contracts'

import type { Provider } from '@ethersproject/abstract-provider'
import type { Signer } from '@ethersproject/abstract-signer'
import type { Address } from 'viem'

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
