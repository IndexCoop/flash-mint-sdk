import { BigNumber } from '@ethersproject/bignumber'
import { getTokenByChainAndSymbol } from '@indexcoop/tokenlists'
import { ChainId } from 'constants/chains'
import {
  QuoteTokens,
  type TestFactory,
  getTestFactoryZeroEx,
  transferFromWhale,
  wei,
  wrapETH,
} from 'tests/utils'

describe('BTC2X (Base)', () => {
  const chainId = ChainId.Base
  const cbbtc = getTokenByChainAndSymbol(chainId, 'cbBTC')
  const { eth } = QuoteTokens
  const indexToken = getTokenByChainAndSymbol(chainId, 'BTC2X')
  const usdc = getTokenByChainAndSymbol(chainId, 'USDC')
  const weth = getTokenByChainAndSymbol(chainId, 'WETH')
  let factory: TestFactory
  beforeEach(async () => {
    factory = getTestFactoryZeroEx(0, chainId)
  })

  test('can mint with ETH', async () => {
    await factory.fetchQuote({
      isMinting: true,
      inputToken: eth,
      outputToken: indexToken,
      indexTokenAmount: wei('1').toString(),
      inputTokenAmount: wei('0.5').toString(),
      slippage: 0.5,
    })
    await factory.executeTx()
  })

  test('can mint with cbBTC', async () => {
    const quote = await factory.fetchQuote({
      isMinting: true,
      inputToken: cbbtc,
      outputToken: indexToken,
      indexTokenAmount: wei('1').toString(),
      inputTokenAmount: wei('0.01').toString(),
      slippage: 0.5,
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

  test('can mint with USDC', async () => {
    const quote = await factory.fetchQuote({
      isMinting: true,
      inputToken: usdc,
      outputToken: indexToken,
      indexTokenAmount: wei('1').toString(),
      inputTokenAmount: wei('500').toString(),
      slippage: 0.5,
    })
    const whale = '0x8dB0f952B8B6A462445C732C41Ec2937bCae9c35'
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
      outputToken: eth,
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
