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

describe('uSOL2x (Base)', () => {
  const chainId = ChainId.Base
  const indexToken = getTokenByChainAndSymbol(chainId, 'uSOL2x')
  const usdc = getTokenByChainAndSymbol(chainId, 'USDC')
  const weth = getTokenByChainAndSymbol(chainId, 'WETH')
  let factory: TestFactory
  beforeEach(async () => {
    factory = getTestFactoryZeroExV2(4, chainId)
  })

  test.only('can mint with ETH', async () => {
    await factory.fetchQuote({
      isMinting: true,
      inputToken: ETH,
      outputToken: indexToken,
      indexTokenAmount: wei('1').toString(),
      inputTokenAmount: wei('0.5').toString(),
      slippage: 0.5,
    })
    await factory.executeTx()
  })

  test.skip('can mint with USDC', async () => {
    const quote = await factory.fetchQuote({
      isMinting: true,
      inputToken: usdc,
      outputToken: indexToken,
      indexTokenAmount: wei('1').toString(),
      inputTokenAmount: wei('500').toString(),
      slippage: 0.5,
    })
    const whale = '0x621e7c767004266c8109e83143ab0Da521B650d6'
    await transferFromWhale(
      whale,
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
      indexTokenAmount: wei('1').toString(),
      inputTokenAmount: wei('0.5').toString(),
      slippage: 0.5,
    })
    await wrapETH(
      quote.inputAmount.mul(BigNumber.from(2)),
      factory.getSigner(),
      chainId,
    )
    await factory.executeTx()
  })

  test('can redeem to ETH', async () => {
    await factory.fetchQuote({
      isMinting: false,
      inputToken: indexToken,
      outputToken: ETH,
      indexTokenAmount: wei('1').toString(),
      inputTokenAmount: wei('1').toString(),
      slippage: 0.5,
    })
    await factory.executeTx()
  })

  test('can redeem to USDC', async () => {
    await factory.fetchQuote({
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
