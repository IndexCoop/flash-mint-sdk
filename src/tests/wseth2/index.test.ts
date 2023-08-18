/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { sETH2, WETH, wsETH2 } from 'constants/tokens'
import {
  LocalhostProvider,
  resetHardhat,
  SignerAccount17,
  swapExactInput,
  TestFactory,
  wei,
  wrapETH,
  ZeroExApiSwapQuote,
} from '../utils'

const zeroExApi = ZeroExApiSwapQuote

describe.skip('wsETH2 (mainnet)', () => {
  let factory: TestFactory
  beforeAll(async () => {
    const blockNumber = 17828035
    const provider = LocalhostProvider
    const signer = SignerAccount17
    await resetHardhat(provider, blockNumber)
    factory = new TestFactory(provider, signer, zeroExApi)
  })

  test('can mint wsETH2 w/ sETH2', async () => {
    const sETH2Address = sETH2.address!
    const ethSETH2PoolAddress = '0x7379e81228514a1D2a6Cf7559203998E20598346'
    const WETH9 = WETH.address!

    const inputToken = {
      address: sETH2.address!,
      decimals: 18,
      symbol: sETH2.symbol,
    }
    const outputToken = {
      address: wsETH2.address!,
      decimals: 18,
      symbol: wsETH2.symbol,
    }

    await factory.fetchQuote({
      isMinting: true,
      inputToken,
      outputToken,
      indexTokenAmount: wei('1'),
      slippage: 1,
    })

    const provider = factory.getProvider()
    const signer = factory.getSigner()

    // Wrap ETH for buying some sETH2
    await wrapETH(wei(2), signer)

    // Get some sETH2
    await swapExactInput(
      ethSETH2PoolAddress,
      {
        amountIn: wei(2),
        amountOutMin: wei(1),
        tokenIn: WETH9,
        tokenOut: sETH2Address,
      },
      provider,
      signer
    )
    await factory.executeTx()
  })
})
