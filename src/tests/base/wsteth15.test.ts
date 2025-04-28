import { getTokenByChainAndSymbol } from '@indexcoop/tokenlists'
import { ChainId } from 'constants/chains'
import { ETH } from 'constants/tokens'
import {
  type TestFactory,
  getTestFactoryZeroExV2,
  transferFromWhale,
  wei,
} from 'tests/utils'

describe('wstETH15x (Base)', () => {
  const chainId = ChainId.Base
  const factory: TestFactory = getTestFactoryZeroExV2(8, chainId)
  const indexToken = getTokenByChainAndSymbol(chainId, 'wstETH15x')
  const whale = '0x621e7c767004266c8109e83143ab0Da521B650d6'

  const testCases = [
    { setAmount: '1', inputAmount: '2', inputToken: 'ETH' },
    { setAmount: '10', inputAmount: '35', inputToken: 'ETH' },
    { setAmount: '1', inputAmount: '5000', inputToken: 'USDC' },
    { setAmount: '10', inputAmount: '50000', inputToken: 'USDC' },
  ]

  for (const {
    setAmount,
    inputAmount,
    inputToken: inputTokenSymbol,
  } of testCases) {
    describe(`SetAmount: ${setAmount} - inputAmount ${inputAmount}`, () => {
      let quote: any

      beforeAll(async () => {
        factory.resetFork(chainId)

        const inputToken =
          inputTokenSymbol === 'ETH'
            ? ETH
            : getTokenByChainAndSymbol(chainId, inputTokenSymbol)

        quote = await factory.fetchQuote({
          chainId,
          isMinting: true,
          inputToken: inputToken!,
          outputToken: indexToken,
          indexTokenAmount: wei(setAmount).toString(),
          inputTokenAmount: wei(inputAmount, inputToken!.decimals).toString(),
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

        if (inputTokenSymbol !== 'ETH') {
          await transferFromWhale(
            whale,
            factory.getSigner().address,
            quote.inputOutputAmount,
            quote.inputToken.address,
          )
        }

        await factory.executeTx()
      })
    })
  }
})
