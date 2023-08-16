import { wei } from 'utils/numbers'

// import { addLiquidityToLido, wrapStEth } from '../utils/lido'
// import { depositIntoRocketPool } from '../utils/rocket'
// import { swapExactInput } from '../utils/uniswap'
import {
  LocalhostProvider,
  QuoteTokens,
  SignerAccount3,
  TestFactory,
  transferFromWhale,
  wrapETH,
  ZeroExApiSwapQuote,
} from '../utils'

const { dseth, eth, reth, usdc, weth } = QuoteTokens
const zeroExApi = ZeroExApiSwapQuote

describe('dsETH (mainnet)', () => {
  let factory: TestFactory
  beforeEach(async () => {
    const provider = LocalhostProvider
    const signer = SignerAccount3
    factory = new TestFactory(provider, signer, zeroExApi)
  })

  test('minting with ETH', async () => {
    const quote = await factory.fetchQuote({
      isMinting: true,
      inputToken: eth,
      outputToken: dseth,
      indexTokenAmount: wei('0.1'),
      slippage: 1,
    })
    console.log(quote)
    await factory.executeTx()
  })

  test('minting with WETH', async () => {
    const quote = await factory.fetchQuote({
      isMinting: true,
      inputToken: weth,
      outputToken: dseth,
      indexTokenAmount: wei('0.1'),
      slippage: 1,
    })
    console.log(quote)
    await wrapETH(quote.inputOutputAmount, factory.getSigner())
    await factory.executeTx()
  })

  test.skip('minting with rETH', async () => {
    const quote = await factory.fetchQuote({
      isMinting: true,
      inputToken: reth,
      outputToken: dseth,
      indexTokenAmount: wei('0.1'),
      slippage: 1,
    })
    const rethWhale = '0x7d6149aD9A573A6E2Ca6eBf7D4897c1B766841B4'
    await transferFromWhale(
      rethWhale,
      factory.getSigner().address,
      quote.inputOutputAmount,
      quote.inputToken.address,
      factory.getProvider()
    )
    await factory.executeTx()
  })
})
