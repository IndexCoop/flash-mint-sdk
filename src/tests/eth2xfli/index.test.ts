import {
  LocalhostProvider,
  QuoteTokens,
  TestFactory,
  SignerAccount1,
  wei,
  ZeroExApiSwapQuote,
  resetHardhat,
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

describe('ETH2xFLI (mainnet)', () => {
  let factory: TestFactory
  beforeAll(async () => {
    const blockNumber = 17826737
    const provider = LocalhostProvider
    const signer = SignerAccount1
    await resetHardhat(provider, blockNumber)
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

  test.skip('can redeem ETH2xFLI', async () => {
    await factory.fetchQuote({
      isMinting: false,
      inputToken: eth2xfli,
      outputToken: eth,
      indexTokenAmount: wei('1'),
      slippage: 1,
    })
    await factory.executeTx()
  })
})
