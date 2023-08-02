import { BigNumber } from '@ethersproject/bignumber'
import {
  approveErc20,
  balanceOf,
  LocalhostProvider,
  QuoteTokens,
  resetHardhat,
  SignerAccount2,
  TestFactory,
  transferFromWhale,
  wei,
  wrapETH,
  ZeroExApiSwapQuote,
} from '../utils'
import { swapQuote01, swapQuote02 } from './quotes'

const { eth, icreth, reth, usdc, weth } = QuoteTokens

const zeroExApi = ZeroExApiSwapQuote
const zeroExMock = jest.spyOn(zeroExApi, 'getSwapQuote')
zeroExMock
  .mockImplementationOnce(async () => {
    return swapQuote01
  })
  .mockImplementationOnce(async () => {
    return swapQuote02
  })

const signer = SignerAccount2
describe('icRETH (mainnet) - ETH', () => {
  let factory: TestFactory
  // TODO: beforeEach vs beforeAll
  beforeEach(async () => {
    const blockNumber = 17828035
    const provider = LocalhostProvider
    // const blockNUm = await provider.getBlockNumber()
    // console.log(blockNUm)
    await resetHardhat(provider, blockNumber)
    factory = new TestFactory(provider, signer, zeroExApi)
  })

  test('can mint icRETH', async () => {
    await factory.fetchQuote({
      isMinting: true,
      inputToken: eth,
      outputToken: icreth,
      indexTokenAmount: wei('1'),
      slippage: 1,
    })
    await factory.executeTx()
  })
})
