import { getTokenByChainAndSymbol } from '@indexcoop/tokenlists'
import { ETH } from 'constants/tokens'
import {
  type TestFactory,
  getTestFactoryZeroExV2,
  transferFromWhale,
  wei,
  wrapETH,
} from './utils'

describe('hyETH', () => {
  const chainId = 1
  const indexToken = getTokenByChainAndSymbol(chainId, 'hyETH')
  const usdc = getTokenByChainAndSymbol(chainId, 'USDC')
  let factory: TestFactory
  beforeEach(async () => {
    factory = getTestFactoryZeroExV2(4)
  })

  test('can mint with ETH', async () => {
    await factory.fetchQuote({
      chainId,
      isMinting: true,
      inputToken: ETH,
      outputToken: indexToken,
      indexTokenAmount: wei('3').toString(),
      inputTokenAmount: wei('4').toString(),
      slippage: 0.5,
    })
    await factory.executeTx()
  })

  test.skip('can mint with WETH', async () => {
    const quote = await factory.fetchQuote({
      chainId,
      isMinting: true,
      inputToken: getTokenByChainAndSymbol(chainId, 'WETH'),
      outputToken: indexToken,
      indexTokenAmount: wei('1').toString(),
      inputTokenAmount: wei('2').toString(),
      slippage: 0.5,
    })
    await wrapETH(quote.inputAmount, factory.getSigner(), chainId)
    await factory.executeTx()
  })

  test.skip('can mint with ETH (large amout)', async () => {
    await factory.fetchQuote({
      chainId,
      isMinting: true,
      inputToken: ETH,
      outputToken: indexToken,
      indexTokenAmount: wei('550').toString(),
      inputTokenAmount: wei('1000').toString(),
      slippage: 0.5,
    })
    await factory.executeTx()
  })

  test('can mint with USDC', async () => {
    const quote = await factory.fetchQuote({
      chainId,
      isMinting: true,
      inputToken: usdc,
      outputToken: indexToken,
      indexTokenAmount: wei('1').toString(),
      inputTokenAmount: wei('2500', 6).toString(),
      slippage: 0.5,
    })
    const whale = '0x7713974908Be4BEd47172370115e8b1219F4A5f0'
    await transferFromWhale(
      whale,
      factory.getSigner().address,
      wei('10000', quote.inputToken.decimals),
      quote.inputToken.address,
      factory.getProvider(),
    )
    await factory.executeTx()
  })

  test('can redeem to ETH', async () => {
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

  test.skip('can redeem to ETH (large amount)', async () => {
    await factory.fetchQuote({
      chainId,
      isMinting: false,
      inputToken: indexToken,
      outputToken: ETH,
      indexTokenAmount: wei('200').toString(),
      inputTokenAmount: wei('200').toString(),
      slippage: 0.5,
    })
    await factory.executeTx()
  })

  test('can redeem to USDC', async () => {
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
})
