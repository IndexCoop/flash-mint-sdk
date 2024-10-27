import { BigNumber } from '@ethersproject/bignumber'
import { Address, formatUnits } from 'viem'

import { getBalanceOf } from 'utils/erc20'
import {
  getMainnetTestFactory,
  QuoteTokens,
  SignerAccount4,
  TestFactory,
  transferFromWhale,
  wei,
} from './utils'

const { icusd, usdc } = QuoteTokens

describe('icUSD (mainnet)', () => {
  const indexToken = icusd
  const signer = SignerAccount4
  let factory: TestFactory
  beforeEach(async () => {
    factory = getMainnetTestFactory(signer)
  })

  test('can mint with USDC', async () => {
    const usdcBalance = await getBalanceOf(
      usdc.address as Address,
      indexToken.address as Address,
      1
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
    const usdcWhale = '0x7713974908Be4BEd47172370115e8b1219F4A5f0'
    await transferFromWhale(
      usdcWhale,
      factory.getSigner().address,
      wei('100000', quote.inputToken.decimals),
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

  test('can redeem to USDC (via FMWrapped)', async () => {
    const usdcBalance = await getBalanceOf(
      usdc.address as Address,
      indexToken.address as Address,
      1
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
