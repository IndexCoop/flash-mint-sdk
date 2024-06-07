/* eslint-disable  @typescript-eslint/no-non-null-assertion */
import { BigNumber } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'

import { WETH } from 'constants/tokens'
import { SwapQuoteProvider } from 'quote/swap'
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
    const pool = this.getPoolContract()
    const exchangeRate: BigNumber = await pool.callStatic.exchangeRateCurrent(
      this.weth
    )
    const ethAmount =
      (exchangeRate.toBigInt() * acrossLpAmount) / BigInt(1e18) +
      this.roundingError
    const quote = await this.swapQuoteProvider.getSwapQuote({
      chainId: 1,
      inputToken,
      outputToken: this.weth,
      outputAmount: ethAmount.toString(),
    })
    if (!quote) return null
    return BigInt(quote.inputAmount)
  }

  async getWithdrawQuote(
    acrossLpAmount: bigint,
    outputToken: string
  ): Promise<bigint | null> {
    const pool = this.getPoolContract()
    const exchangeRate: BigNumber = await pool.callStatic.exchangeRateCurrent(
      this.weth
    )
    const ethAmount =
      (exchangeRate.toBigInt() * acrossLpAmount) / BigInt(1e18) +
      this.roundingError
    const quote = await this.swapQuoteProvider.getSwapQuote({
      chainId: 1,
      inputToken: this.weth,
      outputToken,
      inputAmount: ethAmount.toString(),
    })
    if (!quote) return null
    return BigInt(quote.outputAmount)
  }
}
