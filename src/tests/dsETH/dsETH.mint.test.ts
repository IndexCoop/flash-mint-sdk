import { BigNumber } from '@ethersproject/bignumber'
import { Wallet } from '@ethersproject/wallet'

import {
  DiversifiedStakedETHIndex,
  sETH2,
  stETH,
  USDC,
  WETH,
  wstETH,
} from 'constants/tokens'
import { FlashMintZeroEx } from 'flashMint/zeroEx'
import { QuoteToken } from 'quote/quoteToken'
import { getFlashMintZeroExQuote } from 'quote/zeroEx'
import { getFlashMintZeroExContractForToken } from 'utils/contracts'
import { getIssuanceModule } from 'utils/issuanceModules'
import { wei } from 'utils/numbers'

import { addLiquidityToLido, wrapStEth } from '../utils/lido'
import { depositIntoRocketPool } from '../utils/rocket'
import { swapExactInput } from '../utils/uniswap'
import {
  approveErc20,
  balanceOf,
  createERC20Contract,
  LocalhostProvider,
  SignerAccount0,
  wrapETH,
  ZeroExApiSwapQuote,
} from '../utils'

import {
  dsETH,
  ETH,
  WETH9,
  RETH,
  SETH2,
  STETH,
  WSTETH,
  mint,
} from './dsETH.helpers'

const provider = LocalhostProvider
const signer = SignerAccount0

describe('FlashMintZeroEx - dsETH', () => {
  const outputToken = dsETH
  const indexTokenAmount = wei('0.1')

  beforeEach((): void => {
    jest.setTimeout(10000000)
  })

  test('minting with ETH', async () => {
    await mint(outputToken, indexTokenAmount)
  })

  test('minting with WETH', async () => {
    const inputToken = WETH9
    await wrapETH(wei(2), signer)
    await mintERC20(inputToken, outputToken, indexTokenAmount, 0.5, signer)
  })

  // FIXME: deposit into pool won't work because it reached max capacity
  // test('minting with rETH', async () => {
  //   const inputToken = RETH
  //   const outputToken = dsETH
  //   const indexTokenAmount = wei('0.1')

  //   const signer = SignerAccount0
  //   await depositIntoRocketPool(wei(2), signer)
  //   await mintERC20(inputToken, outputToken, indexTokenAmount, 0.5, signer)
  // })

  test('minting with sETH2', async () => {
    const inputToken = SETH2
    // ETH / sETH2
    const pool = '0x7379e81228514a1d2a6cf7559203998e20598346'
    await wrapETH(wei(2), signer)
    await swapExactInput(
      pool,
      {
        tokenIn: WETH9.address,
        tokenOut: inputToken.address!,
        amountIn: wei('2'),
        amountOutMin: wei('1.5'),
      },
      provider,
      signer
    )

    await mintERC20(inputToken, outputToken, indexTokenAmount, 0.5, signer)
  })

  test('minting with stETH', async () => {
    const inputToken = STETH
    await addLiquidityToLido(wei('2'), signer)
    await mintERC20(inputToken, outputToken, indexTokenAmount, 0.5, signer)
  })

  // FIXME: did work a few times already
  // test('minting with USDC', async () => {
  //   const inputToken = {
  //     address: USDC.address!,
  //     decimals: 6,
  //     symbol: USDC.symbol,
  //   }
  //   const outputToken = dsETH
  //   const indexTokenAmount = wei('0.1')

  //   const signer = SignerAccount0
  //   // ETH / USDC
  //   const pool = '0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640'
  //   await wrapETH(wei(2), signer)
  //   await swapExactInput(
  //     pool,
  //     {
  //       tokenIn: WETH9.address,
  //       tokenOut: inputToken.address!,
  //       amountIn: wei('2'),
  //       amountOutMin: wei('2000', inputToken.decimals),
  //     },
  //     provider,
  //     signer
  //   )
  //   const balanceUsdc = await balanceOf(signer, inputToken.address)
  //   console.log(balanceUsdc.toString(), 'USDC')
  //
  //   await mintERC20(inputToken, outputToken, indexTokenAmount, 0.5, signer)
  // })

  test('minting with wstETH', async () => {
    const inputToken = WSTETH
    await addLiquidityToLido(wei('2'), signer)
    const balance = await balanceOf(signer, STETH.address)
    console.log(balance.toString(), 'stETH')
    await wrapStEth(balance, signer)
    const balancew = await balanceOf(signer, WSTETH.address)
    console.log(balancew.toString(), 'wstETH')
    await mintERC20(inputToken, outputToken, indexTokenAmount, 0.5, signer)
  })
})

async function mintERC20(
  inputToken: QuoteToken,
  outputToken: QuoteToken,
  indexTokenAmount: BigNumber,
  slippage = 0.5,
  signer: Wallet = SignerAccount0
) {
  const chainId = 1
  const zeroExApi = ZeroExApiSwapQuote

  const indexToken = outputToken
  const isMinting = true

  const quote = await getFlashMintZeroExQuote(
    inputToken,
    outputToken,
    indexTokenAmount,
    isMinting,
    slippage,
    zeroExApi,
    provider,
    chainId
  )
  expect(quote).toBeDefined()
  if (!quote) fail()
  expect(quote?.componentQuotes.length).toBeGreaterThan(0)
  expect(quote?.inputOutputTokenAmount).toBeDefined()
  expect(quote?.inputOutputTokenAmount).not.toBe(BigNumber.from(0))
  expect(quote?.setTokenAmount).toEqual(indexTokenAmount)

  // Get FlashMintZeroEx contract instance and issuance module (debtV2)
  const contract = getFlashMintZeroExContractForToken(
    indexToken.symbol,
    signer,
    chainId
  )
  const issuanceModule = getIssuanceModule(indexToken.symbol, chainId)

  console.log(contract.address, 'contract')
  console.log(issuanceModule.address, issuanceModule.isDebtIssuance, 'issuance')

  await approveErc20(
    inputToken.address,
    contract.address,
    quote.inputOutputTokenAmount,
    signer
  )

  const gasEstimate = await contract.estimateGas.issueExactSetFromToken(
    indexToken.address,
    inputToken.address,
    indexTokenAmount,
    quote.inputOutputTokenAmount,
    quote.componentQuotes,
    issuanceModule.address,
    issuanceModule.isDebtIssuance
  )
  console.log(gasEstimate.toString())

  const flashMint = new FlashMintZeroEx(contract)
  const tx = await flashMint.mintExactSetFromToken(
    indexToken.address,
    inputToken.address,
    indexTokenAmount,
    quote.inputOutputTokenAmount,
    quote.componentQuotes,
    issuanceModule.address,
    issuanceModule.isDebtIssuance,
    { gasLimit: gasEstimate }
  )
  if (!tx) fail()
  tx.wait()
  const indexTokenErc20 = createERC20Contract(indexToken.address, signer)
  const balanceOutputToken: BigNumber = await indexTokenErc20.balanceOf(
    signer.address
  )
  console.log(balanceOutputToken.toString())
  expect(balanceOutputToken.gt(0)).toEqual(true)
}
