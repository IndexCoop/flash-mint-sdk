import { getTokenByChainAndSymbol } from '@indexcoop/tokenlists'
import { ChainId } from 'constants/chains'
import { ETH } from 'constants/tokens'
import { getTestFactoryZeroExV2, transferFromWhale, wei } from 'tests/utils'
import type { TestCase, TestFactory } from 'tests/utils'

describe('Mainnet', () => {
  const chainId = ChainId.Mainnet
  const factory: TestFactory = getTestFactoryZeroExV2(0, chainId)
  const whale = '0x768145BcC76a744E7F267b515d6E2488BdA48f0d'

  const testCases: TestCase[] = [
    {
      indexToken: 'ETH2X',
      setAmount: '1',
      inputAmount: '1',
      inputToken: 'ETH',
    },
    {
      indexToken: 'ETH2X',
      setAmount: '10',
      inputAmount: '1',
      inputToken: 'ETH',
    },
    {
      indexToken: 'BTC2X',
      setAmount: '1',
      inputAmount: '1',
      inputToken: 'ETH',
    },
    {
      indexToken: 'BTC2X',
      setAmount: '10',
      inputAmount: '1',
      inputToken: 'ETH',
    },
    {
      indexToken: 'ETH2X',
      setAmount: '1',
      inputAmount: '5000',
      inputToken: 'USDC',
    },
    {
      indexToken: 'ETH2X',
      setAmount: '10',
      inputAmount: '50000',
      inputToken: 'USDC',
    },
    {
      indexToken: 'BTC2X',
      setAmount: '1',
      inputAmount: '5000',
      inputToken: 'USDC',
    },
    {
      indexToken: 'BTC2X',
      setAmount: '10',
      inputAmount: '50000',
      inputToken: 'USDC',
    },
  ]

  for (const testCase of testCases) {
    const {
      indexToken: indexTokenSymbol,
      setAmount,
      inputAmount,
      inputToken: inputTokenSymbol,
    } = testCase
    describe(`SetAmount: ${setAmount} ${indexTokenSymbol} - inputAmount ${inputAmount} ${inputTokenSymbol}`, () => {
      let quote: any

      beforeAll(async () => {
        factory.resetFork(chainId)

        const indexToken = getTokenByChainAndSymbol(chainId, indexTokenSymbol)!
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
            factory.getProvider(),
          )
        }

        await factory.executeTx()
      })

      test.skip('can redeem', async () => {
        const indexToken = getTokenByChainAndSymbol(chainId, indexTokenSymbol)!
        const outputToken =
          inputTokenSymbol === 'ETH'
            ? ETH
            : getTokenByChainAndSymbol(chainId, inputTokenSymbol)!

        quote = await factory.fetchQuote({
          chainId,
          isMinting: false,
          inputToken: indexToken,
          outputToken,
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
