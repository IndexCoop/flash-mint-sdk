import FlashMintLeveragedAbi from 'constants/abis/FlashMintLeveraged.json'

import { getSwapData } from 'quote/swap/adapters/static/swap-data'
import { createClientWithUrl } from 'utils/clients'

import type { QuoteToken } from 'quote/interfaces'
import type { Address } from 'viem'

export interface StaticProviderQuoteRequest {
  chainId: number
  isMinting: boolean
  inputToken: QuoteToken
  outputToken: QuoteToken
  // TODO: change to input/output amount
  indexTokenAmount: bigint
  inputAmount: bigint
  slippage: number
  taker: string
}

export interface StaticSwapQuoteProviderQuote {
  chainId: number
  inputToken: QuoteToken
  outputToken: QuoteToken
  inputAmount: string
  outputAmount: string
  slippage: number
  // TODO:
  //   swapData: SwapDataV2 | null
}

export class StaticSwapQuoteProvider {
  constructor(readonly rpcUrl: string) {}

  async getSwapQuote(
    request: StaticProviderQuoteRequest,
  ): Promise<StaticSwapQuoteProviderQuote | null> {
    const {
      chainId,
      indexTokenAmount,
      // TODO: use when doing static contract call
      inputAmount: maxInputAmount,
      inputToken,
      isMinting,
      outputToken,
      slippage,
      taker,
    } = request

    const indexToken = isMinting ? outputToken : inputToken

    const publicClient = createClientWithUrl(chainId, this.rpcUrl)!

    // TODO: get swap data debt for collateral, swap data input/output token
    const swapData = getSwapData(request)
    // console.log(swapData)

    // FIXME: use from swap data config
    // Contracts[]
    const contractAddress = '0x45c00508C14601fd1C1e296eB3C0e3eEEdCa45D0'

    // TODO: add ABIs[contractAddress]

    console.log(indexToken.address, indexTokenAmount.toString())

    // const swapDataDebtForCollateral: SwapData = {
    //   path: [
    //     '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    //     '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    //   ],
    //   fees: [500],
    //   exchange: 3,
    //   pool: AddressZero,
    // }

    // const swapDataInputToken: SwapData = {
    //   path: ['0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'],
    //   fees: [],
    //   exchange: 0,
    //   pool: AddressZero,
    // }

    const result = await publicClient.simulateContract({
      address: contractAddress as Address,
      abi: FlashMintLeveragedAbi,
      functionName: 'getIssueExactSet',
      args: [
        indexToken.address as Address,
        indexTokenAmount,
        swapData.swapDataDebtForCollateral,
        swapData.swapDataInputToken,
      ],
    })

    console.log('data', result.result)

    // TODO: apply slippage
    const inputOutputAmount = result.result

    const inputAmount = (
      isMinting ? inputOutputAmount : indexTokenAmount
    ).toString()
    const outputAmount = (
      isMinting ? indexTokenAmount : inputOutputAmount
    ).toString()

    return {
      chainId,
      inputToken,
      outputToken,
      inputAmount,
      outputAmount,
      slippage,
      // TODO: add call data encoded for issue/redeem function?
    }
  }
}
