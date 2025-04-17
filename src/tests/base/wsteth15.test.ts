import { getTokenByChainAndSymbol } from '@indexcoop/tokenlists'
import { ChainId } from 'constants/chains'
import {
  type TestFactory,
  getAlchemyProviderUrl,
  getTestFactoryZeroExV2,
  transferFromWhale,
  wei,
} from 'tests/utils'

describe('wstETH15x (Base)', () => {
  const chainId = ChainId.Base
  const indexToken = getTokenByChainAndSymbol(chainId, 'wstETH15x')
  const usdc = getTokenByChainAndSymbol(chainId, 'USDC')
  const factory: TestFactory = getTestFactoryZeroExV2(8, chainId)

  const testCases = [
    { setAmount: '1', usdcAmount: '5000' },
    { setAmount: '10', usdcAmount: '50000' },
  ]

  const whale = '0x621e7c767004266c8109e83143ab0Da521B650d6'
  const alchemyUrl = getAlchemyProviderUrl(chainId)

  for (const { setAmount, usdcAmount } of testCases) {
    describe(`SetAmount: ${setAmount} - usdcAmount ${usdcAmount}`, () => {
      let quote: any

      beforeAll(async () => {
        const localHostProvider = factory.getProvider()

        // Reset fork to latest block to ensure accurate quote
        await localHostProvider.send('hardhat_reset', [
          {
            forking: { jsonRpcUrl: alchemyUrl },
          },
        ])

        quote = await factory.fetchQuote({
          chainId,
          isMinting: true,
          inputToken: usdc,
          outputToken: indexToken,
          indexTokenAmount: wei(setAmount).toString(),
          inputTokenAmount: wei(usdcAmount, 6).toString(),
          slippage: 0.5,
        })
      })

      test('can obtain quote', () => {
        expect(quote).not.toBeNull()
      })

      test('can mint', async () => {
        if (!quote) {
          throw new Error("Can't mint without quote")
        }

        await transferFromWhale(
          whale,
          factory.getSigner().address,
          quote.inputOutputAmount,
          quote.inputToken.address,
          factory.getProvider(),
        )

        await factory.executeTx()
      })
    })
  }
})

// describe.skip('wstETH15x (Base)', () => {
//   const chainId = ChainId.Base
//   const indexToken = getTokenByChainAndSymbol(chainId, 'wstETH15x')
//   const usdc = getTokenByChainAndSymbol(chainId, 'USDC')
//   const weth = getTokenByChainAndSymbol(chainId, 'WETH')
//   let factory: TestFactory
//   beforeAll(async () => {
//     factory = getTestFactoryZeroExV2(8, chainId)
//   })

//   test('can mint with ETH', async () => {
//     await factory.fetchQuote({
//       chainId,
//       isMinting: true,
//       inputToken: ETH,
//       outputToken: indexToken,
//       indexTokenAmount: wei('1').toString(),
//       inputTokenAmount: wei('1.1').toString(),
//       slippage: 0.5,
//     })
//     await factory.executeTx()
//   })

//   test.skip('can mint with WETH', async () => {
//     const quote = await factory.fetchQuote({
//       chainId,
//       isMinting: true,
//       inputToken: weth,
//       outputToken: indexToken,
//       indexTokenAmount: wei('1').toString(),
//       inputTokenAmount: wei('1.1').toString(),
//       slippage: 0.5,
//     })
//     await wrapETH(
//       quote.inputAmount.mul(BigNumber.from(2)),
//       factory.getSigner(),
//       chainId,
//     )
//     await factory.executeTx()
//   })

//   test.skip('can redeem to ETH', async () => {
//     await factory.fetchQuote({
//       chainId,
//       isMinting: false,
//       inputToken: indexToken,
//       outputToken: ETH,
//       indexTokenAmount: wei('1').toString(),
//       inputTokenAmount: wei('1').toString(),
//       slippage: 0.5,
//     })
//     await factory.executeTx()
//   })

//   test.skip('can redeem to USDC', async () => {
//     await factory.fetchQuote({
//       chainId,
//       isMinting: false,
//       inputToken: indexToken,
//       outputToken: usdc,
//       indexTokenAmount: wei('1').toString(),
//       inputTokenAmount: wei('1').toString(),
//       slippage: 0.5,
//     })
//     await factory.executeTx()
//   })
// })
