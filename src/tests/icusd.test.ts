import { BigNumber } from '@ethersproject/bignumber'
import { getTokenByChainAndSymbol } from '@indexcoop/tokenlists'
import { Address, formatUnits } from 'viem'

import { ChainId } from 'constants/chains'
import { getBalanceOf } from 'utils/erc20'
import {
  getBaseTestFactory,
  getSignerAccount,
  LocalhostProviderBase,
  TestFactory,
  transferFromWhale,
  wei,
} from './utils'

describe('icUSD (mainnet)', () => {
  const chainId = ChainId.Base
  const indexToken = getTokenByChainAndSymbol(chainId, 'icUSD')
  const usdc = getTokenByChainAndSymbol(chainId, 'USDC')
  const usdcWhale = '0xC882b111A75C0c657fC507C04FbFcD2cC984F071'
  const signer = getSignerAccount(4, LocalhostProviderBase)
  let factory: TestFactory
  beforeEach(async () => {
    factory = getBaseTestFactory(signer)
  })

  test.only('can mint with USDC', async () => {
    const quote = await factory.fetchQuote({
      isMinting: true,
      inputToken: usdc,
      outputToken: indexToken,
      indexTokenAmount: wei(1),
      inputTokenAmount: BigNumber.from(0),
      slippage: 0.5,
    })
    await transferFromWhale(
      usdcWhale,
      factory.getSigner().address,
      wei('10000', quote.inputToken.decimals),
      quote.inputToken.address,
      factory.getProvider()
    )
    await factory.executeTx()
  })

  // Readd once we use FMWrapped and FMNav again
  test.skip('can mint with USDC', async () => {
    const usdcBalance = await getBalanceOf(
      usdc.address as Address,
      indexToken.address as Address,
      chainId
    )
    // Minting enough tokens for the redemption tests
    const inputAmountGreaterThreshold = (usdcBalance * BigInt(90)) / BigInt(100)
    const quote = await factory.fetchQuote({
      isMinting: true,
      inputToken: usdc,
      outputToken: indexToken,
      // Index token amount will be ignored for minting
      indexTokenAmount: wei(formatUnits(inputAmountGreaterThreshold, 6)),
      inputTokenAmount: BigNumber.from(inputAmountGreaterThreshold.toString()),
      slippage: 0.5,
    })
    await transferFromWhale(
      usdcWhale,
      factory.getSigner().address,
      wei('10000', quote.inputToken.decimals),
      quote.inputToken.address,
      factory.getProvider()
    )
    await factory.executeTx()
  })

  test('can redeem to USDC', async () => {
    await factory.fetchQuote({
      isMinting: false,
      inputToken: indexToken,
      outputToken: usdc,
      // In case of redeeming input and index token amount are the same
      indexTokenAmount: wei('1'),
      inputTokenAmount: wei('1'),
      slippage: 0.5,
    })
    await factory.executeTx()
  })

  // Readd once we use FMWrapped and FMNav again
  test.skip('can redeem to USDC (via FMWrapped)', async () => {
    const usdcBalance = await getBalanceOf(
      usdc.address as Address,
      indexToken.address as Address,
      chainId
    )
    // To test that the FM Wrapped contract is used for redeeming, get an input
    // amount greater than the internal threshold (80%).
    const inputAmountGreaterThreshold = (usdcBalance * BigInt(85)) / BigInt(100)
    await factory.fetchQuote({
      isMinting: false,
      inputToken: indexToken,
      outputToken: usdc,
      // In case of redeeming input and index token amount are the same
      indexTokenAmount: wei(formatUnits(inputAmountGreaterThreshold, 6)),
      inputTokenAmount: wei(formatUnits(inputAmountGreaterThreshold, 6)),
      slippage: 0.5,
    })
    await factory.executeTx()
  })
})
