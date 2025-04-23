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
  {
    indexToken: 'ETH2X',
    setAmount: '1',
    inputAmount: '5000',
    inputToken: 'USDC',
  },
  {
    indexToken: 'BTC2X',
    setAmount: '10',
    inputAmount: '1',
    inputToken: 'ETH',
  },
  {
    indexToken: 'BTC3X',
    setAmount: '1',
    inputAmount: '1',
    inputToken: 'ETH',
  },
  // FIXME: redeeming fails
  // {
  //   indexToken: 'uSOL2x',
  //   setAmount: '1',
  //   inputAmount: '1',
  //   inputToken: 'ETH',
  // },
  // {
  //   indexToken: 'uSOL2x',
  //   setAmount: '1',
  //   inputAmount: '5000',
  //   inputToken: 'USDC',
  // },
  // {
  //   indexToken: 'uSOL3x',
  //   setAmount: '1',
  //   inputAmount: '1',
  //   inputToken: 'ETH',
  // },
  // {
  //   indexToken: 'uSOL3x',
  //   setAmount: '1',
  //   inputAmount: '5000',
  //   inputToken: 'USDC',
  // },
  // {
  //   indexToken: 'uSUI2x',
  //   setAmount: '1',
  //   inputAmount: '1',
  //   inputToken: 'ETH',
  // },
  // {
  //   indexToken: 'uSUI2x',
  //   setAmount: '1',
  //   inputAmount: '5000',
  //   inputToken: 'USDC',
  // },
  // {
  //   indexToken: 'uSUI3x',
  //   setAmount: '1',
  //   inputAmount: '1',
  //   inputToken: 'ETH',
  // },
  // {
  //   indexToken: 'uSUI3x',
  //   setAmount: '1',
  //   inputAmount: '5000',
  //   inputToken: 'USDC',
  // },
  {
    indexToken: 'wstETH15x',
    setAmount: '1',
    inputAmount: '1',
    inputToken: 'ETH',
  },
  {
    indexToken: 'wstETH15x',
    setAmount: '1',
    inputAmount: '5000',
    inputToken: 'USDC',
  },
]

describe('Mainnet', () => {
  const chainId = ChainId.Base
  const whale = '0x621e7c767004266c8109e83143ab0Da521B650d6'
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
        factory = getTestFactoryZeroExV2(3, chainId)
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
