import { BigNumber } from '@ethersproject/bignumber'
import { getTokenByChainAndSymbol } from '@indexcoop/tokenlists'

import { ChainId } from 'constants/chains'
import {
  type TestFactory,
  getTestFactoryZeroEx,
  transferFromWhale,
  wei,
  wrapETH,
} from './utils'

describe('icUSD (Base)', () => {
  const chainId = ChainId.Base
  const indexToken = getTokenByChainAndSymbol(chainId, 'icUSD')
  const usdc = getTokenByChainAndSymbol(chainId, 'USDC')
  const weth = getTokenByChainAndSymbol(chainId, 'WETH')
  const usdcWhale = '0x8dB0f952B8B6A462445C732C41Ec2937bCae9c35'
  let factory: TestFactory
  beforeEach(async () => {
    factory = getTestFactoryZeroEx(4, chainId)
  })

  test('can mint with USDC', async () => {
    const quote = await factory.fetchQuote({
      isMinting: true,
      inputToken: usdc,
      outputToken: indexToken,
      indexTokenAmount: wei(1).toString(),
      // Irrelevant - as right now we don't use FlashMintNav
      inputTokenAmount: '0',
      slippage: 0.5,
    })
    await transferFromWhale(
      usdcWhale,
      factory.getSigner().address,
      wei('10000', quote.inputToken.decimals),
      quote.inputToken.address,
      factory.getProvider(),
    )
    await factory.executeTx()
  })

  test('can mint with WETH', async () => {
    const quote = await factory.fetchQuote({
      isMinting: true,
      inputToken: weth,
      outputToken: indexToken,
      indexTokenAmount: wei(1).toString(),
      // Irrelevant - as right now we don't use FlashMintNav
      inputTokenAmount: '0',
      slippage: 0.5,
    })
    await wrapETH(
      BigNumber.from(quote.inputAmount.mul(BigNumber.from('2'))),
      factory.getSigner(),
      chainId,
    )
    await factory.executeTx()
  })

  test.skip('can mint with DAI', async () => {
    const quote = await factory.fetchQuote({
      isMinting: true,
      inputToken: getTokenByChainAndSymbol(chainId, 'DAI'),
      outputToken: indexToken,
      indexTokenAmount: wei(1).toString(),
      // Irrelevant - as right now we don't use FlashMintNav
      inputTokenAmount: '0',
      slippage: 0.5,
    })
    await transferFromWhale(
      '0x9646D8F3F59bd7882237eE0EE1c00d483552397D',
      factory.getSigner().address,
      wei('10000', quote.inputToken.decimals),
      quote.inputToken.address,
      factory.getProvider(),
    )
    await factory.executeTx()
  })

  test('can redeem to USDC', async () => {
    await factory.fetchQuote({
      isMinting: false,
      inputToken: indexToken,
      outputToken: usdc,
      // In case of redeeming input and index token amount are the same
      indexTokenAmount: wei('1').toString(),
      inputTokenAmount: wei('1').toString(),
      slippage: 0.5,
    })
    await factory.executeTx()
  })

  test('can redeem to WETH', async () => {
    await factory.fetchQuote({
      isMinting: false,
      inputToken: indexToken,
      outputToken: weth,
      // In case of redeeming input and index token amount are the same
      indexTokenAmount: wei('1').toString(),
      inputTokenAmount: wei('1').toString(),
      slippage: 0.5,
    })
    await factory.executeTx()
  })

  // Readd once we use FMWrapped and FMNav again
  // test.skip('can mint with USDC', async () => {
  //   const usdcBalance = await getBalanceOf(
  //     usdc.address as Address,
  //     indexToken.address as Address,
  //     chainId
  //   )
  //   // Minting enough tokens for the redemption tests
  //   const inputAmountGreaterThreshold = (usdcBalance * BigInt(90)) / BigInt(100)
  //   const quote = await factory.fetchQuote({
  //     isMinting: true,
  //     inputToken: usdc,
  //     outputToken: indexToken,
  //     // Index token amount will be ignored for minting
  //     indexTokenAmount: wei(formatUnits(inputAmountGreaterThreshold, 6)),
  //     inputTokenAmount: BigNumber.from(inputAmountGreaterThreshold.toString()),
  //     slippage: 0.5,
  //   })
  //   await transferFromWhale(
  //     usdcWhale,
  //     factory.getSigner().address,
  //     wei('10000', quote.inputToken.decimals),
  //     quote.inputToken.address,
  //     factory.getProvider()
  //   )
  //   await factory.executeTx()
  // })

  // Readd once we use FMWrapped and FMNav again
  // test.skip('can redeem to USDC (via FMWrapped)', async () => {
  //   const usdcBalance = await getBalanceOf(
  //     usdc.address as Address,
  //     indexToken.address as Address,
  //     chainId
  //   )
  //   // To test that the FM Wrapped contract is used for redeeming, get an input
  //   // amount greater than the internal threshold (80%).
  //   const inputAmountGreaterThreshold = (usdcBalance * BigInt(85)) / BigInt(100)
  //   await factory.fetchQuote({
  //     isMinting: false,
  //     inputToken: indexToken,
  //     outputToken: usdc,
  //     // In case of redeeming input and index token amount are the same
  //     indexTokenAmount: wei(formatUnits(inputAmountGreaterThreshold, 6)),
  //     inputTokenAmount: wei(formatUnits(inputAmountGreaterThreshold, 6)),
  //     slippage: 0.5,
  //   })
  //   await factory.executeTx()
  // })
})
