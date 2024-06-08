/* eslint-disable  @typescript-eslint/no-non-null-assertion */
import { BigNumber } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'

import { WETH } from 'constants/tokens'
import { SwapQuoteProvider } from 'quote/swap'
import { isSameAddress } from 'utils/addresses'
import { getRpcProvider } from 'utils/rpc-provider'

export class AcrossQuoteProvider {
  readonly acrossPool = '0xc186fA914353c44b2E33eBE05f21846F1048bEda'
  // https://github.com/IndexCoop/index-coop-smart-contracts/blob/72243db162ad34124db681aad363746bed075944/contracts/exchangeIssuance/FlashMintHyETH.sol#L59
  readonly roundingError = BigInt(10)
  readonly weth = WETH.address!

  constructor(
    private readonly rpcUrl: string,
    private readonly swapQuoteProvider: SwapQuoteProvider
  ) {}

  getPoolContract(): Contract {
    const provider = getRpcProvider(this.rpcUrl)
    const abi = [
      'function exchangeRateCurrent(address l1Token) public returns (uint256)',
    ]
    return new Contract(this.acrossPool, abi, provider)
  }

  async getDepositQuote(
    acrossLpAmount: bigint,
    inputToken: string
  ): Promise<bigint | null> {
    const outputToken = this.weth
    const pool = this.getPoolContract()
    const exchangeRate: BigNumber = await pool.callStatic.exchangeRateCurrent(
      this.weth
    )
    const ethAmount =
      (exchangeRate.toBigInt() * acrossLpAmount) / BigInt(1e18) +
      this.roundingError
    if (isSameAddress(inputToken, outputToken)) return ethAmount
    const quote = await this.swapQuoteProvider.getSwapQuote({
      chainId: 1,
      inputToken,
      outputToken,
      outputAmount: ethAmount.toString(),
    })
    if (!quote) return null
    return BigInt(quote.inputAmount)
  }

  async getWithdrawQuote(
    acrossLpAmount: bigint,
    outputToken: string
  ): Promise<bigint | null> {
    const inputToken = this.weth
    const pool = this.getPoolContract()
    const exchangeRate: BigNumber = await pool.callStatic.exchangeRateCurrent(
      this.weth
    )
    const ethAmount = (exchangeRate.toBigInt() * acrossLpAmount) / BigInt(1e18)
    if (isSameAddress(inputToken, outputToken)) return ethAmount
    const quote = await this.swapQuoteProvider.getSwapQuote({
      chainId: 1,
      inputToken,
      outputToken,
      inputAmount: ethAmount.toString(),
    })
    if (!quote) return null
    return BigInt(quote.outputAmount)
  }
}
