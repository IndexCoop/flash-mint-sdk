import { getTokenByChainAndSymbol } from '@indexcoop/tokenlists'
import { ChainId } from 'constants/chains'
import {
  QuoteTokens,
  type TestFactory,
  getTestFactoryZeroEx,
  transferFromWhale,
  wei,
} from 'tests/utils'

describe('BTC3X (Base)', () => {
  const chainId = ChainId.Base
  const { eth } = QuoteTokens
  const indexToken = getTokenByChainAndSymbol(chainId, 'BTC3X')
  const usdc = getTokenByChainAndSymbol(chainId, 'USDC')
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
      inputTokenAmount: wei(0.5).toString(),
      slippage: 0.5,
    })
    await factory.executeTx()
  })

  test('can mint with USDC', async () => {
    const quote = await factory.fetchQuote({
      isMinting: true,
      inputToken: usdc,
      outputToken: indexToken,
      indexTokenAmount: wei('1').toString(),
      inputTokenAmount: wei('1018', usdc.decimals).toString(),
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

  test('can redeem to ETH', async () => {
    await factory.fetchQuote({
      isMinting: false,
      inputToken: indexToken,
      outputToken: eth,
      indexTokenAmount: wei('1').toString(),
      inputTokenAmount: wei('1').toString(),
      slippage: 0.6,
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
      slippage: 0.6,
    })
    await factory.executeTx()
  })
})
