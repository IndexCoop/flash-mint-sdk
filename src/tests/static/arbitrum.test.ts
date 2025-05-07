import { getTokenByChainAndSymbol } from '@indexcoop/tokenlists'
import { ChainId } from 'constants/chains'
import { ETH } from 'constants/tokens'
import { buildTestCases, getWhale } from 'tests/static/utils'
import { getTestFactoryZeroExV2, transferFromWhale, wei } from 'tests/utils'
import type { TestFactory } from 'tests/utils'

const symbols = [
  'ETH2X',
  'ETH3X',
  'BTC2X',
  'BTC3X',
  // 'BTC2xETH',
  'ETH2xBTC',
  // 'iETH1X',
  // 'iBTC1X',
]

const testCases = buildTestCases(symbols, ChainId.Arbitrum)

describe('Arbitrum', () => {
  const chainId = ChainId.Arbitrum
  let factory: TestFactory

  for (const testCase of testCases) {
    const {
      indexToken: indexTokenSymbol,
      setAmount,
      inputAmount,
      inputToken: inputTokenSymbol,
    } = testCase
    describe(`SetAmount: ${setAmount} ${indexTokenSymbol} - inputAmount ${inputAmount} ${inputTokenSymbol}`, () => {
      const indexToken = getTokenByChainAndSymbol(chainId, indexTokenSymbol)!
      const inputOutputToken =
        inputTokenSymbol === 'ETH'
          ? ETH
          : getTokenByChainAndSymbol(chainId, inputTokenSymbol)!

      beforeAll(async () => {
        factory = getTestFactoryZeroExV2(2, chainId)
        await factory.resetFork(chainId)
      })

      test('can obtain mint quote', async () => {
        const quote = await factory.fetchQuote({
          chainId,
          isMinting: true,
          inputToken: inputOutputToken,
          outputToken: indexToken,
          indexTokenAmount: wei(setAmount).toString(),
          inputTokenAmount: wei(
            inputAmount,
            inputOutputToken.decimals,
          ).toString(),
          slippage: 0.5,
        })
        expect(quote).not.toBeNull()
      })

      test('can mint', async () => {
        if (!factory.quote) {
          throw new Error("Can't mint without quote")
        }

        if (inputTokenSymbol !== 'ETH') {
          const whale = getWhale(inputTokenSymbol, chainId)
          await transferFromWhale(
            whale,
            factory.getSigner().address,
            factory.quote.inputOutputAmount,
            factory.quote.inputToken.address,
            factory.getProvider(),
          )
        }

        await factory.executeTx()
      })

      test('can redeem', async () => {
        const quote = await factory.fetchQuote({
          chainId,
          isMinting: false,
          inputToken: indexToken,
          outputToken: inputOutputToken,
          indexTokenAmount: wei(1, indexToken.decimals).toString(),
          inputTokenAmount: wei(1, indexToken.decimals).toString(),
          slippage: 0.5,
        })

        if (!quote) {
          throw new Error("Can't redeem without quote")
        }

        await factory.executeTx()
      })
    })
  }
})
