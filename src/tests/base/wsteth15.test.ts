import { BigNumber } from '@ethersproject/bignumber'
import { getTokenByChainAndSymbol } from '@indexcoop/tokenlists'
import { ChainId } from 'constants/chains'
import { ETH } from 'constants/tokens'
import {
  type TestFactory,
  getTestFactoryZeroExV2,
  transferFromWhale,
  wei,
  wrapETH,
} from 'tests/utils'

describe('wstETH15x (Base)', () => {
  const chainId = ChainId.Base
  const indexToken = getTokenByChainAndSymbol(chainId, 'wstETH15x')
  const usdc = getTokenByChainAndSymbol(chainId, 'USDC')
  const weth = getTokenByChainAndSymbol(chainId, 'WETH')
  let factory: TestFactory
  beforeEach(async () => {
    factory = getTestFactoryZeroExV2(8, chainId)
  })

  test('can mint with ETH', async () => {
    await factory.fetchQuote({
      chainId,
      isMinting: true,
      inputToken: ETH,
      outputToken: indexToken,
      indexTokenAmount: wei('1').toString(),
      inputTokenAmount: wei('1.1').toString(),
      slippage: 0.5,
    })
    await factory.executeTx()
  })

  test('can quote with USDC (small amount)', async () => {
    const quote = await factory.fetchQuote({
      chainId,
      isMinting: true,
      inputToken: usdc,
      outputToken: indexToken,
      indexTokenAmount: wei('10').toString(),
      inputTokenAmount: wei('50000', 6).toString(),
      slippage: 0.5,
    })
    console.log("quote", quote);
  })

  test.skip('can mint with USDC (small amount)', async () => {
    const quote = await factory.fetchQuote({
      chainId,
      isMinting: true,
      inputToken: usdc,
      outputToken: indexToken,
      indexTokenAmount: wei('10').toString(),
      inputTokenAmount: wei('50000', 6).toString(),
      slippage: 0.5,
    })
    const whale = '0x621e7c767004266c8109e83143ab0da521b650d6'
    await transferFromWhale(
      whale,
      factory.getSigner().address,
      wei('1200000', quote.inputToken.decimals),
      quote.inputToken.address,
      factory.getProvider(),
    )
    await factory.executeTx()
  })

  test('can quote with USDC (big amount)', async () => {
    const quote = await factory.fetchQuote({
      chainId,
      isMinting: true,
      inputToken: usdc,
      outputToken: indexToken,
      indexTokenAmount: wei('100').toString(),
      inputTokenAmount: wei('1200000', 6).toString(),
      slippage: 0.5,
    })
    console.log("quote", quote);
  })

  test.skip('can mint with USDC (big amount)', async () => {
    const quote = await factory.fetchQuote({
      chainId,
      isMinting: true,
      inputToken: usdc,
      outputToken: indexToken,
      indexTokenAmount: wei('100').toString(),
      inputTokenAmount: wei('1200000', 6).toString(),
      slippage: 0.5,
    })
    const whale = '0x621e7c767004266c8109e83143ab0da521b650d6'
    await transferFromWhale(
      whale,
      factory.getSigner().address,
      wei('1200000', quote.inputToken.decimals),
      quote.inputToken.address,
      factory.getProvider(),
    )
    await factory.executeTx()
  })

  test.skip('can mint with WETH', async () => {
    const quote = await factory.fetchQuote({
      chainId,
      isMinting: true,
      inputToken: weth,
      outputToken: indexToken,
      indexTokenAmount: wei('1').toString(),
      inputTokenAmount: wei('1.1').toString(),
      slippage: 0.5,
    })
    await wrapETH(
      quote.inputAmount.mul(BigNumber.from(2)),
      factory.getSigner(),
      chainId,
    )
    await factory.executeTx()
  })

  test.skip('can redeem to ETH', async () => {
    await factory.fetchQuote({
      chainId,
      isMinting: false,
      inputToken: indexToken,
      outputToken: ETH,
      indexTokenAmount: wei('1').toString(),
      inputTokenAmount: wei('1').toString(),
      slippage: 0.5,
    })
    await factory.executeTx()
  })

  test.skip('can redeem to USDC', async () => {
    await factory.fetchQuote({
      chainId,
      isMinting: false,
      inputToken: indexToken,
      outputToken: usdc,
      indexTokenAmount: wei('1').toString(),
      inputTokenAmount: wei('1').toString(),
      slippage: 0.5,
    })
    await factory.executeTx()
  })
})
