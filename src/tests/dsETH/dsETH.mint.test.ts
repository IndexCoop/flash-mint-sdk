import { wei } from 'utils/numbers'

import { addLiquidityToLido, wrapStEth } from '../utils/lido'
import { depositIntoRocketPool } from '../utils/rocket'
import { swapExactInput } from '../utils/uniswap'
import {
  LocalhostProvider,
  QuoteTokens,
  SignerAccount3,
  transferFromWhale,
} from '../utils'

import { mint, mintERC20 } from './dsETH.helpers'

const provider = LocalhostProvider
const signer = SignerAccount3

const { dseth, usdc } = QuoteTokens

describe('FlashMintZeroEx - dsETH', () => {
  const outputToken = dseth
  const indexTokenAmount = wei('0.1')

  beforeEach((): void => {
    jest.setTimeout(10000000)
  })

  test('minting with ETH', async () => {
    await mint(outputToken, indexTokenAmount)
  })

  // test('minting with WETH', async () => {
  //   const inputToken = WETH9
  //   await wrapETH(wei(2), signer)
  //   await mintERC20(inputToken, outputToken, indexTokenAmount, 0.5, signer)
  // })

  //   test('minting with rETH', async () => {
  //     const inputToken = RETH
  //     // Does not work - due to the rocket pool being filled to max capacity
  //     // await depositIntoRocketPool(wei(2), signer)
  //     const whale = '0x7C5aaA2a20b01df027aD032f7A768aC015E77b86'
  //     await transferFromWhale(
  //       whale,
  //       signer.address,
  //       wei('10', inputToken.decimals),
  //       inputToken.address,
  //       provider
  //     )
  //     await mintERC20(inputToken, outputToken, indexTokenAmount, 0.5, signer)
  //   })

  //   test('minting with sETH2', async () => {
  //     const inputToken = SETH2
  //     // ETH / sETH2
  //     const pool = '0x7379e81228514a1d2a6cf7559203998e20598346'
  //     await wrapETH(wei(2), signer)
  //     await swapExactInput(
  //       pool,
  //       {
  //         tokenIn: WETH9.address,
  //         tokenOut: inputToken.address!,
  //         amountIn: wei('2'),
  //         amountOutMin: wei('1.5'),
  //       },
  //       provider,
  //       signer
  //     )

  //     await mintERC20(inputToken, outputToken, indexTokenAmount, 0.5, signer)
  //   })

  //   test('minting with stETH', async () => {
  //     const inputToken = STETH
  //     await addLiquidityToLido(wei('2'), signer)
  //     await mintERC20(inputToken, outputToken, indexTokenAmount, 0.5, signer)
  //   })

  test('minting with USDC', async () => {
    const inputToken = usdc
    const whale = '0xE11f040179922e54f927D133A3663550568da77d'
    await transferFromWhale(
      whale,
      signer.address,
      wei('10000', inputToken.decimals),
      inputToken.address,
      provider
    )
    await mintERC20(inputToken, outputToken, indexTokenAmount, 0.5, signer)
  })

  //   test('minting with wstETH', async () => {
  //     const inputToken = WSTETH
  //     await addLiquidityToLido(wei('2'), signer)
  //     const balance = await balanceOf(signer, STETH.address)
  //     await wrapStEth(balance, signer)
  //     await mintERC20(inputToken, outputToken, indexTokenAmount, 0.5, signer)
  //   })
})
