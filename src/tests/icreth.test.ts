/* eslint-disable  @typescript-eslint/no-non-null-assertion */
import { BigNumber } from '@ethersproject/bignumber'

import { LeveragedTransactionBuilder } from 'flashmint/builders'
import { LeveragedQuoteProvider } from 'quote/leveraged'
import { wei } from 'utils/numbers'

import {
  balanceOf,
  LocalhostProvider,
  QuoteTokens,
  SignerAccount2,
  ZeroExApiSwapQuote,
  createERC20Contract,
  approveErc20,
} from './utils'

const provider = LocalhostProvider
const signer = SignerAccount2
const zeroExApi = ZeroExApiSwapQuote

// FIXME: add tests for all tokens (mint + redeem)
const { eth, icreth, reth, usdc, weth } = QuoteTokens

const stealTokens = async (
  token: string,
  amount: BigNumber,
  fromWhale: string
) => {
  const contract = createERC20Contract(token, provider)
  const balance = await contract.balanceOf(fromWhale)
  if (balance.lt(amount)) {
    throw new Error(
      `Not enough balance to steal ${amount} ${token} from ${fromWhale}`
    )
  }
  await provider.send('hardhat_impersonateAccount', [fromWhale])
  const impersonatedSigner = provider.getSigner(fromWhale)
  await contract.connect(impersonatedSigner).transfer(signer.address, amount)
  await provider.send('hardhat_stopImpersonatingAccount', [fromWhale])
}
describe('icRETH (mainnet)', () => {
  describe('given a network provider, quote provider and tx builder', () => {
    // Depends on a quote provider to be defined, but we don't know the type of a quote provider
    type QuoterConfig<T extends typeof quoteProvider> = Parameters<
      T['getQuote']
    >[0]
    type QuoteConfig = QuoterConfig<typeof quoteProvider>

    const quoteProvider = new LeveragedQuoteProvider(provider, zeroExApi)
    const txBuilder = new LeveragedTransactionBuilder(provider)
    const configureTXFactory = <T extends typeof quoteProvider>(
      quoter: T,
      builderFactory: typeof txBuilder
    ) => {
      const quote = async (config: QuoterConfig<T>) => {
        const result = await quoter.getQuote(config)
        if (!result)
          throw new Error(
            'No quote provided for config: \n' +
              JSON.stringify(config, null, 2) +
              '\n'
          )

        return { config, result }
      }
      const build = async (quoted: Awaited<ReturnType<typeof quote>>) => {
        const {
          indexTokenAmount,
          inputOutputTokenAmount,
          swapDataDebtCollateral,
          swapDataPaymentToken,
        } = quoted.result

        const config = quoted.config
        const { isMinting, outputToken, inputToken } = config
        const tx = await builderFactory.build({
          isMinting,
          indexToken: isMinting ? outputToken.address : inputToken.address,
          indexTokenSymbol: isMinting ? outputToken.symbol : inputToken.symbol,
          inputOutputToken: isMinting
            ? inputToken.address
            : outputToken.address,
          inputOutputTokenSymbol: isMinting
            ? inputToken.symbol
            : outputToken.symbol,
          indexTokenAmount,
          inputOutputTokenAmount,
          swapDataDebtCollateral,
          swapDataPaymentToken,
        })
        if (!tx || !tx.to) throw new Error('No tx could be built')
        const approveTX = async () => {
          if (!tx.to) throw new Error('No tx could be built')
          if (config.inputToken.address !== eth.address) {
            await approveErc20(
              config.inputToken.address,
              tx.to,
              isMinting ? inputOutputTokenAmount : indexTokenAmount,
              signer
            )
          }
        }
        return { tx, approveTX }
      }
      return { quote, build }
    }
    const factory = configureTXFactory(quoteProvider, txBuilder)

    describe('given the signer has eth, weth, reth and usdc', () => {
      beforeAll(async () => {
        const rethWhale = '0x7d6149aD9A573A6E2Ca6eBf7D4897c1B766841B4'
        const wethWhale = '0xe5F8086DAc91E039b1400febF0aB33ba3487F29A'
        const usdcWhale = '0x51eDF02152EBfb338e03E30d65C15fBf06cc9ECC'
        await stealTokens(weth.address, wei(100), wethWhale)
        await stealTokens(reth.address, wei(100), rethWhale)
        await stealTokens(usdc.address, wei(100_000, 6), usdcWhale)
      })
      describe('reth mint and redeem', () => {
        const mintQuoteConfig: QuoteConfig = {
          inputToken: reth,
          outputToken: icreth,
          indexTokenAmount: wei('1'),
          isMinting: true,
          slippage: 0.1,
        }
        const redeemQuoteConfig: QuoteConfig = {
          inputToken: icreth,
          outputToken: reth,
          indexTokenAmount: wei('1'),
          isMinting: false,
          slippage: 0.1,
        }

        test('can quote icRETH from rEth', async () => {
          const { result: quote, config } = await factory.quote(mintQuoteConfig)
          expect(quote.inputOutputTokenAmount.gt(0)).toBe(true)
          expect(quote.indexTokenAmount).toEqual(config.indexTokenAmount)
          expect(quote.swapDataDebtCollateral).toBeDefined()
          expect(quote.swapDataPaymentToken).toBeDefined()
        })

        test('can mint icRETH from rEth', async () => {
          const quote = await factory.quote(mintQuoteConfig)
          const { tx, approveTX } = await factory.build(quote)
          await approveTX()
          const balanceBefore: BigNumber = await balanceOf(
            signer,
            quote.config.outputToken.address
          )
          const gasEstimate = await signer.estimateGas(tx)
          tx.gasLimit = gasEstimate
          const res = await signer.sendTransaction(tx)
          await res.wait()
          const balanceAfter: BigNumber = await balanceOf(
            signer,
            quote.config.outputToken.address
          )
          expect(
            balanceAfter.gte(balanceBefore.add(quote.config.indexTokenAmount))
          ).toBe(true)
        })
        describe('given a minted icRETH', () => {
          beforeAll(async () => {
            const { tx, approveTX } = await factory.build(
              await factory.quote(mintQuoteConfig)
            )
            await approveTX()
            const gasEstimate = await signer.estimateGas(tx)
            tx.gasLimit = gasEstimate
            const res = await signer.sendTransaction(tx)
            await res.wait()
          })

          test('can quote rETH from icRETH', async () => {
            const { result: quote, config } = await factory.quote(
              redeemQuoteConfig
            )
            expect(quote.inputOutputTokenAmount.gt(0)).toBe(true)
            expect(quote.indexTokenAmount).toEqual(config.indexTokenAmount)
            expect(quote.swapDataDebtCollateral).toBeDefined()
            expect(quote.swapDataPaymentToken).toBeDefined()
          })

          test('can redeem rETH from icRETH', async () => {
            const quote = await factory.quote(redeemQuoteConfig)
            const { tx, approveTX } = await factory.build(quote)

            const balanceBefore: BigNumber = await balanceOf(
              signer,
              quote.config.outputToken.address
            )
            await approveTX()
            const gasEstimate = await signer.estimateGas(tx)
            tx.gasLimit = gasEstimate
            const res = await signer.sendTransaction(tx)
            await res.wait()
            const balanceAfter: BigNumber = await balanceOf(
              signer,
              redeemQuoteConfig.outputToken.address
            )
            expect(
              balanceAfter.gte(
                balanceBefore.add(quote.result.inputOutputTokenAmount)
              )
            ).toBe(true)
          })
        })
      })

      describe('usdc mint and redeem', () => {
        const mintQuoteConfig: QuoteConfig = {
          inputToken: usdc,
          outputToken: icreth,
          indexTokenAmount: wei('1'),
          isMinting: true,
          slippage: 0.1,
        }
        const redeemQuoteConfig: QuoteConfig = {
          inputToken: icreth,
          outputToken: usdc,
          indexTokenAmount: wei('1'),
          isMinting: false,
          slippage: 0.1,
        }

        test('can quote icRETH from usdc', async () => {
          const { result: quote, config } = await factory.quote(mintQuoteConfig)
          expect(quote.inputOutputTokenAmount.gt(0)).toBe(true)
          expect(quote.indexTokenAmount).toEqual(config.indexTokenAmount)
          expect(quote.swapDataDebtCollateral).toBeDefined()
          expect(quote.swapDataPaymentToken).toBeDefined()
        })

        test('can mint icRETH from usdc', async () => {
          const quote = await factory.quote(mintQuoteConfig)
          const { tx, approveTX } = await factory.build(quote)
          await approveTX()
          const balanceBefore: BigNumber = await balanceOf(
            signer,
            quote.config.outputToken.address
          )
          const gasEstimate = await signer.estimateGas(tx)
          tx.gasLimit = gasEstimate
          const res = await signer.sendTransaction(tx)
          await res.wait()
          const balanceAfter: BigNumber = await balanceOf(
            signer,
            quote.config.outputToken.address
          )
          expect(
            balanceAfter.gte(balanceBefore.add(quote.config.indexTokenAmount))
          ).toBe(true)
        })
        describe('given a minted icRETH', () => {
          beforeAll(async () => {
            const { tx, approveTX } = await factory.build(
              await factory.quote(mintQuoteConfig)
            )
            await approveTX()
            const gasEstimate = await signer.estimateGas(tx)
            tx.gasLimit = gasEstimate
            const res = await signer.sendTransaction(tx)
            await res.wait()
          })

          test('can quote usdc from icRETH', async () => {
            const { result: quote, config } = await factory.quote(
              redeemQuoteConfig
            )
            expect(quote.inputOutputTokenAmount.gt(0)).toBe(true)
            expect(quote.indexTokenAmount).toEqual(config.indexTokenAmount)
            expect(quote.swapDataDebtCollateral).toBeDefined()
            expect(quote.swapDataPaymentToken).toBeDefined()
          })

          test('can redeem usdc from icRETH', async () => {
            const quote = await factory.quote(redeemQuoteConfig)
            const { tx, approveTX } = await factory.build(quote)

            const balanceBefore: BigNumber = await balanceOf(
              signer,
              quote.config.outputToken.address
            )
            await approveTX()
            const gasEstimate = await signer.estimateGas(tx)
            tx.gasLimit = gasEstimate
            const res = await signer.sendTransaction(tx)
            await res.wait()
            const balanceAfter: BigNumber = await balanceOf(
              signer,
              redeemQuoteConfig.outputToken.address
            )
            expect(
              balanceAfter.gte(
                balanceBefore.add(quote.result.inputOutputTokenAmount)
              )
            ).toBe(true)
          })
        })
      })
    })
  })
})
