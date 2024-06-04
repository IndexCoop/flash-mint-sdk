import { Contract } from '@ethersproject/contracts'

import FLASHMINT_HYETH_ABI from 'constants/abis/FlashMintHyEth.json'
import { FlashMintHyEthAddress } from 'constants/contracts'
import { QuoteProvider, QuoteToken } from 'quote/interfaces'
import { getRpcProvider } from 'utils/rpc-provider'
import { SwapData, wei } from 'utils'

import {
  getComponentsSwapData,
  getEthToInputOutputTokenSwapData,
  getInputTokenToEthSwapData,
} from './swap-data'
import { BigNumber } from '@ethersproject/bignumber'

export interface FlashMintHyEthQuoteRequest {
  isMinting: boolean
  inputToken: QuoteToken
  outputToken: QuoteToken
  indexTokenAmount: bigint
  slippage: number
}

export interface FlashMintHyEthQuote {
  indexTokenAmount: bigint
  inputOutputTokenAmount: bigint
  // Represents `swapDataEthToComponent` for minting
  // and `swapDataComponentToEth` for redeeming
  componentsSwapData: SwapData[]
  // Used only for minting w/ ERC-20 tokens
  swapDataInputTokenToEth: SwapData | null
  // Represents `swapDataEthToInputToken` for minting w/ ERC-20 token
  // and `swapDataEthToOutputToken` for redeeming to ERC-20 token
  swapDataEthToInputOutputToken: SwapData | null
}

export class FlashMintHyEthQuoteProvider
  implements QuoteProvider<FlashMintHyEthQuoteRequest, FlashMintHyEthQuote>
{
  constructor(private readonly rpcUrl: string) {}

  async getQuote(
    request: FlashMintHyEthQuoteRequest
  ): Promise<FlashMintHyEthQuote | null> {
    const provider = getRpcProvider(this.rpcUrl)
    const { indexTokenAmount, inputToken, isMinting, outputToken } = request
    const componentsSwapData = getComponentsSwapData(isMinting)
    // Only relevant for minting ERC-20's
    const swapDataInputTokenToEth = isMinting
      ? getInputTokenToEthSwapData(inputToken)
      : null
    const inputOutputToken = isMinting ? inputToken : outputToken
    const swapDataEthToInputOutputToken =
      getEthToInputOutputTokenSwapData(inputOutputToken)
    // TODO: static call write functions?
    const indexToken = isMinting ? outputToken : inputToken
    const contract = new Contract(
      FlashMintHyEthAddress,
      FLASHMINT_HYETH_ABI,
      provider
    )
    // TODO: switch to provider.call(tx) from builder to handle issue/redeem
    // TODO: just for testing, delete later
    const inputOutputTokenAmount: BigNumber =
      await contract.callStatic.issueExactSetFromETH(
        indexToken.address,
        indexTokenAmount,
        componentsSwapData,
        // TODO:
        { value: wei(1) }
      )
    console.log(inputOutputTokenAmount.toString())
    return {
      indexTokenAmount,
      inputOutputTokenAmount: inputOutputTokenAmount.toBigInt(),
      componentsSwapData,
      swapDataInputTokenToEth,
      swapDataEthToInputOutputToken,
    }
  }
}
