import { BigNumber } from '@ethersproject/bignumber'

import { MoneyMarketIndex, USDC, WETH } from 'constants/tokens'
import { QuoteToken } from 'quote/quoteToken'
import { LocalhostProvider } from 'tests/utils'
import { ComponentSwapData } from 'utils/componentSwapData'
import { wei } from 'utils/numbers'
import { ComponentWrapData } from 'utils/wrapData'
import {
  FlashMintWrappedBuildRequest,
  WrappedTransactionBuilder,
} from './wrapped'
import { Exchange } from 'utils/swapData'

// TODO: does the builder need a provider?
const provider = LocalhostProvider
const ZERO_BYTES = '0x0000000000000000000000000000000000000000'

const indexToken: QuoteToken = {
  address: MoneyMarketIndex.address!,
  decimals: 18,
  symbol: MoneyMarketIndex.symbol,
}

const usdc: QuoteToken = {
  address: USDC.address!,
  decimals: 6,
  symbol: USDC.symbol,
}

describe('WrappedTransactionBuilder()', () => {
  beforeEach((): void => {
    jest.setTimeout(10000000)
  })

  test('returns null for invalid request (no index token)', async () => {
    let buildRequest = getDummyBuildRequest()
    buildRequest.indexToken = ''
    console.log(buildRequest)
    const builder = new WrappedTransactionBuilder()
    const tx = await builder.build(buildRequest)
    expect(tx).toBeNull()
  })

  test('returns null for invalid request (no input/output token)', async () => {
    let buildRequest = getDummyBuildRequest()
    buildRequest.inputOutputToken = ''
    console.log(buildRequest)
    const builder = new WrappedTransactionBuilder()
    const tx = await builder.build(buildRequest)
    expect(tx).toBeNull()
  })

  test('returns null for invalid request (indexTokenAmount = 0)', async () => {
    let buildRequest = getDummyBuildRequest()
    buildRequest.indexTokenAmount = BigNumber.from(0)
    console.log(buildRequest)
    const builder = new WrappedTransactionBuilder()
    const tx = await builder.build(buildRequest)
    expect(tx).toBeNull()
  })

  test('returns null for invalid request (inputOutputTokenAmount = 0)', async () => {
    let buildRequest = getDummyBuildRequest()
    buildRequest.inputOutputTokenAmount = BigNumber.from(0)
    console.log(buildRequest)
    const builder = new WrappedTransactionBuilder()
    const tx = await builder.build(buildRequest)
    expect(tx).toBeNull()
  })

  test('returns null for invalid request (no component swap data)', async () => {
    let buildRequest = getDummyBuildRequest()
    buildRequest.componentSwapData = []
    console.log(buildRequest)
    const builder = new WrappedTransactionBuilder()
    const tx = await builder.build(buildRequest)
    expect(tx).toBeNull()
  })

  test('returns null for invalid request (no wrap data)', async () => {
    let buildRequest = getDummyBuildRequest()
    buildRequest.componentWrapData = []
    console.log(buildRequest)
    const builder = new WrappedTransactionBuilder()
    const tx = await builder.build(buildRequest)
    expect(tx).toBeNull()
  })

  // test('returns a tx for MMI', async () => {
  //   const inputToken = usdc
  //   const buildRequest: FlashMintWrappedBuildRequest = {
  //     indexToken: indexToken.address,
  //     inputOutputToken: inputToken.address,
  //     indexTokenAmount: BigNumber.from(0),
  //     inputOutputTokenAmount: BigNumber.from(0),
  //     componentSwapData: [],
  //     componentWrapData: [],
  //   }
  //   const builder = new WrappedTransactionBuilder()
  //   const tx = await builder.build(buildRequest)
  //   // if (!quote) fail()
  //   expect(tx).toBeNull()
  //   // TODO: decode tx. how?
  // })
})

function getDummyBuildRequest(): FlashMintWrappedBuildRequest {
  const inputToken = usdc
  const componentSwapData: ComponentSwapData = {
    underlyingERC20: usdc.address,
    buyUnderlyingAmount: BigNumber.from(100),
    dexData: {
      exchange: Exchange.UniV3,
      path: [],
      fees: [3000],
      pool: ZERO_BYTES,
    },
  }
  const wrapData: ComponentWrapData = {
    integrationName: '',
    wrapData: ZERO_BYTES,
  }
  return {
    indexToken: indexToken.address,
    inputOutputToken: inputToken.address,
    indexTokenAmount: BigNumber.from(100),
    inputOutputTokenAmount: BigNumber.from(1000),
    componentSwapData: [componentSwapData],
    componentWrapData: [wrapData],
  }
}
