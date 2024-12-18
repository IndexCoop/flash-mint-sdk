/* eslint-disable  @typescript-eslint/no-non-null-assertion */
import { IndexCoopInverseEthereumIndex } from 'constants/tokens'
import {
  getArbitrumTestFactory,
  getSignerAccount,
  LocalhostProviderArbitrum,
  QuoteTokens,
  TestFactory,
  wei,
} from 'tests/utils'

const { eth } = QuoteTokens
const ieth1x = {
  address: IndexCoopInverseEthereumIndex.addressArbitrum!,
  decimals: 18,
  symbol: IndexCoopInverseEthereumIndex.symbol,
}

describe('iETH1X (Arbitrum)', () => {
  let factory: TestFactory
  beforeEach(async () => {
    const provider = LocalhostProviderArbitrum
    const signer = getSignerAccount(1, provider)
    factory = getArbitrumTestFactory(signer)
  })

  test('can mint with ETH', async () => {
    await factory.fetchQuote({
      isMinting: true,
      inputToken: eth,
      outputToken: ieth1x,
      indexTokenAmount: wei('1').toString(),
      slippage: 0.5,
    })
    await factory.executeTx()
  })

  test('can redeem with ETH', async () => {
    await factory.fetchQuote({
      isMinting: false,
      inputToken: ieth1x,
      outputToken: eth,
      indexTokenAmount: wei('1').toString(),
      slippage: 0.5,
    })
    await factory.executeTx()
  })
})
