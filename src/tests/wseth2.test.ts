import { BigNumber } from '@ethersproject/bignumber'

import { sETH2, WETH, wsETH2 } from 'constants/tokens'
import {
  LocalhostProvider,
  SignerAccount0,
  ZeroExApiSwapQuote,
  createERC20Contract,
} from 'tests/utils'
import { wei } from 'utils/numbers'

import { FlashMintZeroEx } from '../flashMint/zeroEx'
import { getFlashMintZeroExQuote } from '../quote/zeroEx'
import { getFlashMintZeroExContractForToken } from '../utils/contracts'
import { getIssuanceModule } from '../utils/issuanceModules'

import { swapExactInput } from './utils/uniswap'
import { wrapETH } from './utils'

describe('FlashMintZeroEx - wsETH2', () => {
  const chainId = 1
  const zeroExApi = ZeroExApiSwapQuote

  beforeEach((): void => {
    jest.setTimeout(10000000)
  })

  test('wsETH2 minting works using sETH2', async () => {
    const isMinting = true
    const provider = LocalhostProvider
    const signer = SignerAccount0

    const sETH2Address = sETH2.address!
    const ethSETH2PoolAddress = '0x7379e81228514a1D2a6Cf7559203998E20598346'
    const WETH9 = WETH.address!

    const amountIn = wei(2)
    const amountOutMin = wei(1)

    // Wrap ETH for buying some sETH2
    await wrapETH(amountIn, signer)

    // Get some sETH2
    await swapExactInput(
      ethSETH2PoolAddress,
      { amountIn, amountOutMin, tokenIn: WETH9, tokenOut: sETH2Address },
      provider,
      signer
    )

    // Check getting sETH2 worked
    const erc20SETH2 = createERC20Contract(sETH2Address, signer)
    const balanceSETH2: BigNumber = await erc20SETH2.balanceOf(signer.address)
    expect(balanceSETH2.gt(0)).toBe(true)

    // Get FlashMintZeroEx Quote
    const inputToken = {
      address: sETH2.address!,
      decimals: 18,
      symbol: sETH2.symbol,
    }
    const outputToken = {
      address: wsETH2.address!,
      decimals: 18,
      symbol: wsETH2.symbol,
    }
    const setTokenAmount = wei('1')
    const quote = await getFlashMintZeroExQuote(
      inputToken,
      outputToken,
      setTokenAmount,
      isMinting,
      0.5,
      zeroExApi,
      provider,
      chainId
    )

    expect(quote).toBeDefined()
    if (!quote) fail()
    expect(quote.componentQuotes.length).toBeGreaterThan(0)
    expect(quote.inputOutputTokenAmount).toBeDefined()
    expect(quote.inputOutputTokenAmount.gt(0)).toBe(true)
    expect(quote.setTokenAmount).toEqual(setTokenAmount)

    // Get FlashMintZeroEx contract instance and issuance module (debtV2)
    const contract = getFlashMintZeroExContractForToken(
      wsETH2.symbol,
      signer,
      chainId
    )
    const issuanceModule = getIssuanceModule(outputToken.symbol, chainId)

    // Approve the ERC20 input token (amount) w/ the FlashMintZeroEx contract as spender
    const erc20 = createERC20Contract(inputToken.address, signer)
    const txApprove = await erc20.approve(
      contract.address,
      quote.inputOutputTokenAmount.mul(2)
    )
    await txApprove.wait()

    // Get a gas estimate
    const gasEstimate = await contract.estimateGas.issueExactSetFromToken(
      outputToken.address,
      inputToken.address,
      setTokenAmount,
      quote.inputOutputTokenAmount,
      quote.componentQuotes,
      issuanceModule.address,
      issuanceModule.isDebtIssuance
    )

    const flashMint = new FlashMintZeroEx(contract)
    const tx = await flashMint.mintExactSetFromToken(
      outputToken.address,
      inputToken.address,
      setTokenAmount,
      quote.inputOutputTokenAmount,
      quote.componentQuotes,
      issuanceModule.address,
      issuanceModule.isDebtIssuance,
      { gasLimit: gasEstimate }
    )
    if (!tx) fail()
    tx?.wait()
    const erc20OutputToken = createERC20Contract(outputToken.address, signer)
    const balanceOutputToken: BigNumber = await erc20OutputToken.balanceOf(
      signer.address
    )
    expect(balanceOutputToken.gt(0)).toEqual(true)
  })
})
