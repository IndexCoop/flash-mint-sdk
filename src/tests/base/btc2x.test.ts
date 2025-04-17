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

describe.skip('BTC2X (Base)', () => {
  const chainId = ChainId.Base
  const cbbtc = getTokenByChainAndSymbol(chainId, 'cbBTC')
  const indexToken = getTokenByChainAndSymbol(chainId, 'BTC2X')
  const usdc = getTokenByChainAndSymbol(chainId, 'USDC')
  const weth = getTokenByChainAndSymbol(chainId, 'WETH')
  let factory: TestFactory
  beforeEach(async () => {
    factory = getTestFactoryZeroExV2(0, chainId)
  })

  test('can mint with ETH', async () => {
    await factory.fetchQuote({
      chainId,
      isMinting: true,
      inputToken: ETH,
      outputToken: indexToken,
      indexTokenAmount: wei('1').toString(),
      inputTokenAmount: wei('0.5').toString(),
      slippage: 1.5,
    })
    await factory.executeTx()
  })

  test('can mint with cbBTC', async () => {
    const quote = await factory.fetchQuote({
      chainId,
      isMinting: true,
      inputToken: cbbtc,
      outputToken: indexToken,
      indexTokenAmount: wei('1').toString(),
      inputTokenAmount: wei('0.2').toString(),
      slippage: 1.5,
    })
    const whale = '0x9d719096fF38c8D6652Cd95233e58452f4F4a2f0'
    await transferFromWhale(
      whale,
      factory.getSigner().address,
      wei('1', quote.inputToken.decimals),
      quote.inputToken.address,
      factory.getProvider(),
    )
    await factory.executeTx()
  })

  test.only('can mint with USDC', async () => {
    const quote = await factory.fetchQuote({
      chainId,
      isMinting: true,
      inputToken: usdc,
      outputToken: indexToken,
      indexTokenAmount: wei('1').toString(),
      inputTokenAmount: wei('1500').toString(),
      slippage: 1.5,
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
      chainId,
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

  test('can redeem to USDC', async () => {
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
