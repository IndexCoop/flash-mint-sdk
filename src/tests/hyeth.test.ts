import {
  getMainnetTestFactory,
  getMainnetTestFactoryUniswap,
  QuoteTokens,
  SignerAccount4,
  TestFactory,
  transferFromWhale,
  wei,
  LocalhostProvider,
} from './utils'
import { getFlashMintHyEthContract } from '../utils/contracts'
import { ethers } from 'ethers'
import { parseUnits } from '@ethersproject/units'

const { eth, hyeth, usdc } = QuoteTokens

async function impersonateAccount(address: string, provider: any) {
  console.log('provider', provider)
  await provider.send('hardhat_impersonateAccount', [address])
  return provider.getSigner(address)
}

describe('hyETH', () => {
  const indexToken = hyeth
  const signer = SignerAccount4
  let factory: TestFactory
  beforeEach(async () => {
    factory = getMainnetTestFactory(signer)

    let flashMintHyEth = getFlashMintHyEthContract(signer)
    const owner = await flashMintHyEth.owner()
    const ownerSigner = await impersonateAccount(owner, LocalhostProvider)
    flashMintHyEth = flashMintHyEth.connect(ownerSigner)
    const tx = await flashMintHyEth.setPendleMarket(
      '0xf7906F274c174A52d444175729E3fa98f9bde285',
      '0x22E12A50e3ca49FB183074235cB1db84Fe4C716D',
      '0xbf5495Efe5DB9ce00f80364C8B423567e58d2110',
      '0xD8F12bCDE578c653014F27379a6114F67F0e445f',
      parseUnits('1.005', 18)
    )
    await tx.wait()
    console.log('setPendleMarket tx', tx)
  })

  // IndexSwapQuoteProvider

  test.skip('can mint with ETH (IndexSwapQuoteProvider)', async () => {
    const factory = getMainnetTestFactoryUniswap(signer)
    await factory.fetchQuote({
      isMinting: true,
      inputToken: eth,
      outputToken: indexToken,
      indexTokenAmount: wei('1'),
      slippage: 0.5,
    })
    await factory.executeTx()
  })

  test.skip('can mint with USDC (IndexSwapQuoteProvider)', async () => {
    const factory = getMainnetTestFactoryUniswap(signer)
    const quote = await factory.fetchQuote({
      isMinting: true,
      inputToken: usdc,
      outputToken: indexToken,
      indexTokenAmount: wei('1'),
      slippage: 0.5,
    })
    const whale = '0x7713974908Be4BEd47172370115e8b1219F4A5f0'
    await transferFromWhale(
      whale,
      factory.getSigner().address,
      wei('100000', quote.inputToken.decimals),
      quote.inputToken.address,
      factory.getProvider()
    )
    await factory.executeTx()
  })

  test.skip('can redeem to ETH (IndexSwapQuoteProvider)', async () => {
    const factory = getMainnetTestFactoryUniswap(signer)
    await factory.fetchQuote({
      isMinting: false,
      inputToken: indexToken,
      outputToken: eth,
      indexTokenAmount: wei('1'),
      slippage: 0.5,
    })
    await factory.executeTx()
  })

  // 0x

  test('can mint with ETH', async () => {
    await factory.fetchQuote({
      isMinting: true,
      inputToken: eth,
      outputToken: indexToken,
      indexTokenAmount: wei('1'),
      slippage: 0.5,
    })
    await factory.executeTx()
  })

  test('can mint with ETH (large amout)', async () => {
    await factory.fetchQuote({
      isMinting: true,
      inputToken: eth,
      outputToken: indexToken,
      indexTokenAmount: wei('550'),
      slippage: 0.5,
    })
    await factory.executeTx()
  })

  test('can mint with USDC', async () => {
    const quote = await factory.fetchQuote({
      isMinting: true,
      inputToken: usdc,
      outputToken: indexToken,
      indexTokenAmount: wei('1'),
      slippage: 0.5,
    })
    const whale = '0x7713974908Be4BEd47172370115e8b1219F4A5f0'
    await transferFromWhale(
      whale,
      factory.getSigner().address,
      wei('100000', quote.inputToken.decimals),
      quote.inputToken.address,
      factory.getProvider()
    )
    await factory.executeTx()
  })

  test('can redeem to ETH', async () => {
    const quote = await factory.fetchQuote({
      isMinting: false,
      inputToken: indexToken,
      outputToken: eth,
      indexTokenAmount: wei('1'),
      slippage: 0.5,
    })
    const whale = '0x6e2C509D522d47F509E1a6D75682E6AbBC38B362'
    await transferFromWhale(
      whale,
      factory.getSigner().address,
      quote.indexTokenAmount,
      quote.inputToken.address,
      factory.getProvider()
    )
    await factory.executeTx()
  })

  test.skip('can redeem to ETH (large amount)', async () => {
    await factory.fetchQuote({
      isMinting: false,
      inputToken: indexToken,
      outputToken: eth,
      indexTokenAmount: wei('200'),
      slippage: 0.5,
    })
    await factory.executeTx()
  })

  test('can redeem to USDC', async () => {
    const quote = await factory.fetchQuote({
      isMinting: false,
      inputToken: indexToken,
      outputToken: eth,
      indexTokenAmount: wei('1'),
      slippage: 0.5,
    })
    const whale = '0x6e2C509D522d47F509E1a6D75682E6AbBC38B362'
    await transferFromWhale(
      whale,
      factory.getSigner().address,
      quote.indexTokenAmount,
      quote.inputToken.address,
      factory.getProvider()
    )
    await factory.executeTx()
  })
})
