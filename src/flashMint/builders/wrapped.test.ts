import { BigNumber } from '@ethersproject/bignumber'

import { MoneyMarketIndex, USDC, WETH } from 'constants/tokens'
import { QuoteToken } from 'quote/quoteToken'
import { LocalhostProvider } from 'tests/utils'
import { wei } from 'utils/numbers'
import {
  FlashMintWrappedBuildRequest,
  WrappedTransactionBuilder,
} from './wrapped'

const provider = LocalhostProvider

const indexToken: QuoteToken = {
  address: MoneyMarketIndex.address!,
  decimals: 18,
  symbol: MoneyMarketIndex.symbol,
}

describe('WrappedTransactionBuilder()', () => {
  beforeEach((): void => {
    jest.setTimeout(10000000)
  })

  test('returns a tx for MMI', async () => {
    const inputToken: QuoteToken = {
      address: USDC.address!,
      decimals: 6,
      symbol: USDC.symbol,
    }
    const buildRequest: FlashMintWrappedBuildRequest = {
      indexToken: indexToken.address,
      inputOutputToken: inputToken.address,
      indexTokenAmount: BigNumber.from(0),
      inputOutputTokenAmount: BigNumber.from(0),
      componentSwapData: [],
      componentWrapData: [],
    }
    const builder = new WrappedTransactionBuilder()
    const tx = await builder.build(buildRequest)
    // if (!quote) fail()
    expect(tx).toBeNull()
  })
})
