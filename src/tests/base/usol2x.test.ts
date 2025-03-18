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
  const taker = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'
  const chainId = ChainId.Base
  const indexToken = getTokenByChainAndSymbol(chainId, 'uSOL2x')
  const usdc = getTokenByChainAndSymbol(chainId, 'USDC')
  const weth = getTokenByChainAndSymbol(chainId, 'WETH')
  let factory: TestFactory
  beforeEach(async () => {
    factory = getTestFactoryZeroExV2(4, chainId)
  })

  test.only('can mint with ETH', async () => {
    const quote = await factory.fetchQuote({
      isMinting: true,
      inputToken: ETH,
      outputToken: indexToken,
      indexTokenAmount: wei('1').toString(),
      inputTokenAmount: wei('0.5').toString(),
      slippage: 0.5,
      taker,
    })
    console.log(quote)
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
      taker,
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
      taker,
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
      taker,
    })
    await factory.executeTx()
  })

  test.skip('can redeem to USDC', async () => {
    await factory.fetchQuote({
      isMinting: false,
      inputToken: indexToken,
      outputToken: usdc,
      indexTokenAmount: wei('1').toString(),
      inputTokenAmount: wei('1').toString(),
      slippage: 0.5,
      taker,
    })
    await factory.executeTx()
  })
})
