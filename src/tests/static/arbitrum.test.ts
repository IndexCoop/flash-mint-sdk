import { getTokenByChainAndSymbol } from '@indexcoop/tokenlists'
import { ChainId } from 'constants/chains'
import { ETH } from 'constants/tokens'
import { getTestFactoryZeroExV2, transferFromWhale, wei } from 'tests/utils'
import type { TestCase, TestFactory } from 'tests/utils'

const testCases: TestCase[] = [
  {
    indexToken: 'ETH2X',
    setAmount: '1',
    inputAmount: '1',
    inputToken: 'ETH',
  },
  // {
  //   indexToken: 'ETH2X',
  //   setAmount: '10',
  //   inputAmount: '1',
  //   inputToken: 'ETH',
  // },
  {
    indexToken: 'ETH3X',
    setAmount: '1',
    inputAmount: '1',
    inputToken: 'ETH',
  },
  {
    indexToken: 'BTC2X',
    setAmount: '1',
    inputAmount: '1',
    inputToken: 'ETH',
  },
  // {
  //   indexToken: 'BTC2X',
  //   setAmount: '10',
  //   inputAmount: '1',
  //   inputToken: 'ETH',
  // },
  {
    indexToken: 'BTC3X',
    setAmount: '1',
    inputAmount: '1',
    inputToken: 'ETH',
  },
  {
    indexToken: 'ETH2X',
    setAmount: '1',
    inputAmount: '5000',
    inputToken: 'USDC',
  },
  // {
  //   indexToken: 'ETH2X',
  //   setAmount: '10',
  //   inputAmount: '50000',
  //   inputToken: 'USDC',
  // },
  {
    indexToken: 'ETH3X',
    setAmount: '10',
    inputAmount: '50000',
    inputToken: 'USDC',
  },
  {
    indexToken: 'BTC2X',
    setAmount: '10',
    inputAmount: '50000',
    inputToken: 'USDC',
  },
  {
    indexToken: 'BTC3X',
    setAmount: '1',
    inputAmount: '5000',
    inputToken: 'USDC',
  },
]

/** 
const testCases: TestCase[] = [
  {
    indexToken: 'BTC2xETH',
    setAmount: '1',
    inputAmount: '1',
    inputToken: 'ETH',
  },
  {
    indexToken: 'BTC2xETH',
    setAmount: '1',
    inputAmount: '100',
    inputToken: 'USDC',
  },
  {
    indexToken: 'ETH2xBTC',
    setAmount: '1',
    inputAmount: '1',
    inputToken: 'ETH',
  },
  {
    indexToken: 'ETH2xBTC',
    setAmount: '1',
    inputAmount: '100',
    inputToken: 'USDC',
  },
  {
    indexToken: 'iETH1X',
    setAmount: '1',
    inputAmount: '1',
    inputToken: 'ETH',
  },
  {
    indexToken: 'iETH1X',
    setAmount: '1',
    inputAmount: '100',
    inputToken: 'USDC',
  },
  {
    indexToken: 'iBTC1X',
    setAmount: '1',
    inputAmount: '1',
    inputToken: 'ETH',
  },
  {
    indexToken: 'iBTC1X',
    setAmount: '1',
    inputAmount: '100',
    inputToken: 'USDC',
  },
]
  */

describe('Arbitrum', () => {
  const chainId = ChainId.Arbitrum
  const whale = '0x0F896345B538Ac140Ac84f3367a65a34eFD8fcBf'
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
