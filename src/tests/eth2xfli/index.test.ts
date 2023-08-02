import {
  LocalhostProvider,
  QuoteTokens,
  TestFactory,
  SignerAccount1,
  wei,
  ZeroExApiSwapQuote,
} from '../utils'
import { swapQuote01, swapQuote02 } from './quotes'

const { eth, eth2xfli } = QuoteTokens
const zeroExApi = ZeroExApiSwapQuote
const zeroExMock = jest.spyOn(zeroExApi, 'getSwapQuote')
zeroExMock
  .mockImplementationOnce(async () => {
    return swapQuote01
  })
  .mockImplementationOnce(async () => {
    return swapQuote02
  })

describe('ETH2xFLI (mainnet)2', () => {
  let factory: TestFactory
  beforeAll(() => {
    const provider = LocalhostProvider
    const signer = SignerAccount1
    factory = new TestFactory(provider, signer, zeroExApi)
  })

  test('can mint ETH2xFLI', async () => {
    await factory.fetchQuote({
      isMinting: true,
      inputToken: eth,
      outputToken: eth2xfli,
      indexTokenAmount: wei('1'),
      slippage: 1,
    })
    await factory.executeTx()
  })
})
