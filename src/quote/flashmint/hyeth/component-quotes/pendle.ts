/* eslint-disable  @typescript-eslint/no-non-null-assertion */
import { BigNumber } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'

import FLASHMINT_HYETH_ABI from 'constants/abis/FlashMintHyEth.json'
import { FlashMintHyEthAddress } from 'constants/contracts'
import { WETH } from 'constants/tokens'
import { SwapQuoteProvider } from 'quote/swap'
import { getRpcProvider } from 'utils/rpc-provider'

export class PendleQuoteProvider {
  readonly routerStaticMainnet = '0x263833d47eA3fA4a30f269323aba6a107f9eB14C'
  readonly weth = WETH.address!

  constructor(
    private readonly rpcUrl: string,
    private readonly swapQuoteProvider: SwapQuoteProvider
  ) {}

  getFlashMintHyEth(): Contract {
    const provider = getRpcProvider(this.rpcUrl)
    return new Contract(FlashMintHyEthAddress, FLASHMINT_HYETH_ABI, provider)
  }

  getRouterStatic(address: string): Contract {
    const provider = getRpcProvider(this.rpcUrl)
    const abi = [
      'function getPtToAssetRate(address market) public view returns (uint256)',
    ]
    return new Contract(address, abi, provider)
  }

  getPtContract(pt: string): Contract {
    const provider = getRpcProvider(this.rpcUrl)
    const abi = ['function SY() view returns (address)']
    return new Contract(pt, abi, provider)
  }

  //   getSyContract(sy: string): Contract {
  //     const provider = getRpcProvider(this.rpcUrl)
  //     const abi = [
  //       'function _previewDeposit(address tokenIn, uint256 amountTokenToDeposit) view returns (uint256 amountSharesOut) ',
  //     ]
  //     return new Contract(sy, abi, provider)
  //   }

  async getDepositQuote(
    component: string,
    position: bigint,
    inputToken: string
  ): Promise<bigint | null> {
    const fmHyEth = this.getFlashMintHyEth()
    const market = await fmHyEth.pendleMarkets(component)
    // const ptContract = this.getPtContract(component)
    // const sy = await ptContract.SY()
    // console.log(sy, 'SY', component)
    const routerContract = this.getRouterStatic(this.routerStaticMainnet)
    const assetRate: BigNumber = await routerContract.getPtToAssetRate(market)
    const ethAmount = (position * assetRate.toBigInt()) / BigInt(1e18)
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
    component: string,
    position: bigint,
    outputToken: string
  ): Promise<bigint | null> {
    const fmHyEth = this.getFlashMintHyEth()
    const market = await fmHyEth.pendleMarkets(component)
    const routerContract = this.getRouterStatic(this.routerStaticMainnet)
    const assetRate: BigNumber = await routerContract.getPtToAssetRate(market)
    const ethAmount = (position * assetRate.toBigInt()) / BigInt(1e18)
    const quote = await this.swapQuoteProvider.getSwapQuote({
      chainId: 1,
      inputToken: this.weth,
      outputToken,
      inputAmount: ethAmount.toString(),
    })
    if (!quote) return null
    return BigInt(quote.inputAmount)
  }
}
