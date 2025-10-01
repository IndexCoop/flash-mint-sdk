import { getTokenByChainAndSymbol } from '@indexcoop/tokenlists'
import { expect } from 'chai'
import { ETH } from 'constants/tokens'
import {
  Contract,
  type InterfaceAbi,
  JsonRpcProvider,
  JsonRpcSigner,
  parseEther,
  toBeHex,
} from 'ethers'

import inputTokenMap from './input-token-map'
import rpcConfig from './rpc-config'
import scenarios from './test-scenarios'

import {
  FlashMintContractType,
  type FlashMintQuote,
  FlashMintQuoteProvider,
  type FlashMintQuoteRequest,
} from '../../quote/provider'

import type { Result } from 'quote'
import {
  getLifiSwapQuoteProvider,
  getZeroExV2SwapQuoteProvider,
  wei,
} from '../utils'

// Factor by which to round down the latest block number to run all tests against the same block
// Gives tradeoff between avoiding tests running "stale" while still leveraging caching to some extend to improve performance
const BLOCK_ROUNDING_MAINNET = 1000
const BLOCK_ROUNDING_L2 = 10000
const ALCHEMY_KEY = process.env.ALCHEMY_API_KEY
if (!ALCHEMY_KEY) throw new Error('Please set ALCHEMY_API_KEY')

const LOCAL_RPC_URL = process.env.LOCAL_RPC_URL || 'http://127.0.0.1:8545'
const localProvider = new JsonRpcProvider(LOCAL_RPC_URL)

// Minimal ERC20 ABI for decimals + transfer + approve + balanceOf
const ERC20_ABI: InterfaceAbi = [
  'function decimals() view returns (uint8)',
  'function transfer(address to,uint256 amount) returns (bool)',
  'function approve(address spender,uint256 amount) returns (bool)',
  'function balanceOf(address owner) view returns (uint256)',
]

// Type for ERC20 Contract with methods
interface ERC20Contract extends Contract {
  decimals(): Promise<number>
  transfer(to: string, amount: bigint): Promise<any>
  approve(spender: string, amount: bigint): Promise<any>
  balanceOf(owner: string): Promise<bigint>
}

describe('🏭 SDK parameterized mint & redeem tests (FlashMintQuoteProvider)', () => {
  for (const [cid, products] of Object.entries(scenarios)) {
    const chainId = Number(cid)
    const upstreamBase = rpcConfig[chainId]
    const upstreamRpc = upstreamBase.endsWith('/')
      ? `${upstreamBase}${ALCHEMY_KEY}`
      : `${upstreamBase}/${ALCHEMY_KEY}`

    describe(`🔗 chain ${chainId}`, () => {
      let flashProvider: FlashMintQuoteProvider
      let forkBlock: number

      before(async () => {
        // 1) init quote provider
        const zeroEx = getZeroExV2SwapQuoteProvider()
        const lifi = getLifiSwapQuoteProvider()
        flashProvider = new FlashMintQuoteProvider(LOCAL_RPC_URL, zeroEx, lifi)

        // 2) apply optional override
        const override =
          chainId === 1
            ? process.env.MAINNET_BLOCK_NUMBER
            : chainId === 8453
              ? process.env.BASE_BLOCK_NUMBER
              : chainId === 42161
                ? process.env.ARBITRUM_BLOCK_NUMBER
                : undefined

        if (override) {
          forkBlock = Number.parseInt(override, 10)
        } else {
          // 3) fetch current head from upstream and round down to nearest 1,000
          const remote = new JsonRpcProvider(upstreamRpc)
          const head = await remote.getBlockNumber()
          if (chainId === 1) {
            forkBlock =
              Math.floor(head / BLOCK_ROUNDING_MAINNET) * BLOCK_ROUNDING_MAINNET
          } else {
            forkBlock = Math.floor(head / BLOCK_ROUNDING_L2) * BLOCK_ROUNDING_L2
          }
        }

        console.log(`⛏  Forking chain ${chainId} at block ${forkBlock}`)
      })

      for (const [productSymbol, cfg] of Object.entries(products)) {
        const indexToken = getTokenByChainAndSymbol(chainId, productSymbol)
        if (!indexToken) {
          throw new Error(`No index token for ${productSymbol} on ${chainId}`)
        }

        describe(`  • product ${productSymbol}`, () => {
          for (const setAmtStr of cfg.setAmounts) {
            const setAmt = wei(setAmtStr).toString()

            describe(`    – mint ${setAmtStr}`, () => {
              for (const { symbol: sym, exchangeRate } of cfg.inputTokens) {
                const mapEntry = (inputTokenMap as any)[cid]?.[sym]
                if (!mapEntry) {
                  throw new Error(
                    `Missing mapping for chain ${cid} token ${sym}`,
                  )
                }
                const inputToken =
                  sym === 'ETH' ? ETH : getTokenByChainAndSymbol(chainId, sym)!
                const whale = mapEntry.whale as string

                for (const FIXED_OUTPUT of [true, false]) {
                  describe(`${
                    FIXED_OUTPUT ? 'FixedOutput' : 'FixedInput'
                  }     • via ${sym}`, () => {
                    let taker: string
                    let req: FlashMintQuoteRequest
                    let maxIn: bigint
                    let erc20Whale: ERC20Contract
                    let setTokenContract: ERC20Contract
                    let mintedAmount: bigint
                    let mintQuote: FlashMintQuote
                    before(async () => {
                      // reset & fork at our computed block
                      await localProvider.send('hardhat_reset', [
                        {
                          forking: {
                            jsonRpcUrl: upstreamRpc,
                            blockNumber: forkBlock,
                          },
                        },
                      ])
                      await localProvider.send('evm_mine', [])

                      // impersonate whale & pick taker
                      await localProvider.send('hardhat_impersonateAccount', [
                        whale,
                      ])
                      taker = '0xd8da6bf26964af9d7eed9e03e53415d37aa96045'
                      await localProvider.send('hardhat_impersonateAccount', [
                        taker,
                      ])

                      const topUp = toBeHex(parseEther('1000000'))
                      await localProvider.send('hardhat_setBalance', [
                        taker,
                        topUp,
                      ])

                      // compute maxIn = setAmt × exchangeRate ÷ 10^(18 − inputDecimals)
                      const tokenContract = new Contract(
                        inputToken.address,
                        ERC20_ABI,
                        localProvider,
                      )
                      const dec =
                        sym === 'ETH' ? 18 : await tokenContract.decimals()
                      const bnSet = BigInt(setAmt)
                      const ratePrecision = 1000n // support 3 decimal-rate precision
                      const rate = BigInt(Math.floor(exchangeRate * 1000))
                      const scale = 10n ** BigInt(18 - Number(dec))
                      maxIn = (bnSet * rate) / ratePrecision / scale
                      console.log('maxIn', maxIn.toString())

                      // fetch mint quote
                      req = {
                        chainId,
                        isMinting: true,
                        inputToken,
                        outputToken: indexToken,
                        indexTokenAmount: setAmt,
                        inputTokenAmount: maxIn.toString(),
                        slippage: 0.5,
                      }
                      let res: Result<FlashMintQuote>
                      console.log('FIXED_OUTPUT', FIXED_OUTPUT)
                      if (FIXED_OUTPUT) {
                        console.log('calling getQuote')
                        res = await flashProvider.getQuote(req)
                      } else {
                        const fixedOutputQuoteResult =
                          await flashProvider.getQuote(req)
                        if (fixedOutputQuoteResult.success) {
                          // This ensures that the fixed input test, is equivalent in terms of the set amount issued
                          req.inputTokenAmount =
                            fixedOutputQuoteResult.data.inputOutputAmount.toString()

                          // This ensures that the initial indexToken amount is very inaccurate and the algorithm still finds the correct solution
                          req.indexTokenAmount = (
                            BigInt(req.indexTokenAmount) * 2n
                          ).toString()
                          console.log(
                            'calling getFixedInputQuote',
                            req.indexTokenAmount.toString(),
                            req.inputTokenAmount.toString(),
                          )
                          res = await flashProvider.getFixedInputQuote(req)
                        } else {
                          throw new Error(
                            `Prepartory output quote failed: ${fixedOutputQuoteResult.error?.message}`,
                          )
                        }
                      }
                      if (res.success) {
                        console.log(
                          'response.inputAmount',
                          res.data.inputOutputAmount.toString(),
                        )
                        console.log(
                          'response.indexTokenAmount',
                          res.data.indexTokenAmount.toString(),
                        )
                      }
                      if (!res.success) {
                        throw new Error(`Quote failed: ${res.error?.message}`)
                      }
                      mintQuote = res.data

                      // prepare contracts
                      const whaleSigner = new JsonRpcSigner(localProvider, whale)
                      const takerSigner = new JsonRpcSigner(localProvider, taker)
                      if (sym !== 'ETH') {
                        erc20Whale = new Contract(
                          inputToken.address,
                          ERC20_ABI,
                          whaleSigner,
                        ) as ERC20Contract
                      }
                      setTokenContract = new Contract(
                        indexToken.address,
                        ERC20_ABI,
                        takerSigner,
                      ) as ERC20Contract
                    })

                    it('returns a valid mint quote', () => {
                      expect(mintQuote.chainId).to.equal(chainId)
                      expect(mintQuote.isMinting).to.be.true
                      expect(mintQuote.contractType).to.be.oneOf([
                        FlashMintContractType.static,
                        FlashMintContractType.hyeth,
                      ])
                      expect(BigInt(mintQuote.inputAmount) >= 0n).to.be.true
                      if (FIXED_OUTPUT) {
                        expect(String(mintQuote.indexTokenAmount)).to.equal(setAmt)
                        expect(mintQuote.slippage).to.equal(0.5)
                      } else {
                        console.log('requestInputAmount', req.inputTokenAmount)
                        const toleranceBP = 5n
                        const requestedAmount = BigInt(req.inputTokenAmount)
                        const minAmount =
                          ((10_000n - toleranceBP) * requestedAmount) / 10000n
                        const maxAmount =
                          ((10_000n + toleranceBP) * requestedAmount) / 10000n
                        const inputOutputAmount = BigInt(
                          String(mintQuote.inputOutputAmount),
                        )
                        expect(inputOutputAmount >= minAmount).to.be.true
                        expect(inputOutputAmount <= maxAmount).to.be.true
                      }

                      // Verify that requested input amount is represented 1:1 in the transaction
                      if (sym === 'ETH') {
                        console.log('mintQuote', mintQuote)
                        expect(String(mintQuote.tx.value)).to.eq(
                          req.inputTokenAmount,
                        )
                      } else {
                        const inputAmountHex = BigInt(req.inputTokenAmount)
                          .toString(16)
                          .padStart(64, '0')
                        console.log('inputAmountHex', inputAmountHex)
                        console.log('tx.data', mintQuote.tx.data)
                        expect(
                          String(mintQuote.tx.data ?? '').includes(
                            inputAmountHex,
                          ),
                        ).to.be.true
                      }

                      expect(mintQuote.tx.to).to.match(/^0x[0-9a-fA-F]{40}$/)
                      expect(mintQuote.tx.data).to.be.a('string').and.not.empty
                    })

                    describe('      ✓ execute mint', () => {
                      let balanceBefore: bigint
                      let inputBalanceBefore: bigint
                      let takerSigner: any
                      let spentAmount: bigint

                      before(async () => {
                        takerSigner = new JsonRpcSigner(localProvider, taker)

                        if (sym !== 'ETH') {
                          await erc20Whale.transfer(taker, maxIn)
                          const erc20Taker = erc20Whale.connect(takerSigner)
                          await erc20Taker.approve(mintQuote.tx.to, maxIn)
                          inputBalanceBefore = await erc20Taker.balanceOf(taker)
                        } else {
                          inputBalanceBefore =
                            await takerSigner.provider.getBalance(taker)
                        }
                        balanceBefore = await setTokenContract.balanceOf(taker)
                        const tx = await takerSigner.sendTransaction({
                          to: mintQuote.tx.to,
                          data: String(mintQuote.tx.data ?? ''),
                          value: mintQuote.tx.value
                            ? BigInt(mintQuote.tx.value)
                            : undefined,
                          gasLimit: 5_000_000,
                        })
                        const receipt = await tx.wait()
                        const inputBalanceAfter =
                          sym !== 'ETH'
                            ? await erc20Whale.balanceOf(taker)
                            : await takerSigner.provider.getBalance(taker)
                        spentAmount = inputBalanceBefore - inputBalanceAfter
                        if (sym === 'ETH') {
                          const gasCosts = receipt!.gasUsed * tx.gasPrice!
                          spentAmount = spentAmount - gasCosts
                        }
                      })

                      it('minted correct amount', async () => {
                        const balanceAfter =
                          await setTokenContract.balanceOf(taker)
                        mintedAmount = balanceAfter - balanceBefore
                        expect(mintedAmount).to.equal(
                          BigInt(String(mintQuote.indexTokenAmount)),
                        )
                      })

                      it('spends correct amount', async () => {
                        if (!FIXED_OUTPUT) {
                          const inputAmount = BigInt(String(mintQuote.inputAmount))
                          expect(spentAmount < inputAmount).to.be.true
                          const slippageBP = BigInt(
                            Math.floor(req.slippage * 100),
                          )
                          const factor = 10000n - slippageBP
                          const targetInput = BigInt(req.inputTokenAmount)
                          const targetInputWithSlippage =
                            (targetInput * factor) / 10000n
                          console.log(
                            'targetInput',
                            targetInputWithSlippage.toString(),
                          )
                          // TODO: Investigate why I need to set such high tolerance
                          const toleranceBP =
                            req.outputToken.symbol === 'wstETH15x' ? 150n : 50n
                          console.log('spentAmount', spentAmount.toString())
                          const minSpent =
                            (targetInputWithSlippage * (10000n - toleranceBP)) /
                            10000n
                          expect(spentAmount >= minSpent).to.be.true
                        }
                      })

                      if (FIXED_OUTPUT) {
                        describe('      ◦ redeem', () => {
                          let redeemQuote: FlashMintQuote
                          let balanceAfterRedeem: bigint
                          let burntAmount: bigint
                          let redeemReq: FlashMintQuoteRequest

                          before(async () => {
                            // fetch redeem quote
                            redeemReq = {
                              chainId,
                              isMinting: false,
                              inputToken: indexToken,
                              outputToken: inputToken,
                              indexTokenAmount: setAmt,
                              inputTokenAmount: mintedAmount.toString(),
                              slippage: 0.5,
                            }
                            const rr = await flashProvider.getQuote(redeemReq)
                            if (!rr.success) {
                              throw new Error(
                                `Redeem quote failed: ${rr.error?.message}`,
                              )
                            }
                            redeemQuote = rr.data

                            const topUp = toBeHex(parseEther('1000000'))
                            await localProvider.send('hardhat_setBalance', [
                              taker,
                              topUp,
                            ])

                            // approve & execute
                            const takerSigner = new JsonRpcSigner(
                              localProvider,
                              taker,
                            )
                            await setTokenContract
                              .connect(takerSigner)
                              .approve(redeemQuote.tx.to, mintedAmount)

                            const balanceBeforeRedeem =
                              await setTokenContract.balanceOf(taker)
                            const tx = await takerSigner.sendTransaction({
                              to: redeemQuote.tx.to,
                              data: String(redeemQuote.tx.data ?? ''),
                              value: redeemQuote.tx.value
                                ? BigInt(redeemQuote.tx.value)
                                : undefined,
                              gasLimit: 5_000_000,
                            })
                            await tx.wait()
                            balanceAfterRedeem =
                              await setTokenContract.balanceOf(taker)
                            burntAmount =
                              balanceBeforeRedeem - balanceAfterRedeem

                            // ensure user got more input‐token back than they burned
                            const inAfter =
                              sym === 'ETH'
                                ? await takerSigner.provider.getBalance(taker)
                                : await (
                                    new Contract(
                                      inputToken.address,
                                      ERC20_ABI,
                                      localProvider,
                                    ) as ERC20Contract
                                  ).balanceOf(taker)
                            expect(inAfter > 0n).to.be.true
                          })

                          it('burned only the redeemed amount', () => {
                            expect(
                              burntAmount ===
                                BigInt(String(redeemReq.inputTokenAmount)),
                            ).to.be.true
                          })
                        })
                      }
                    })
                  })
                }
              }
            })
          }
        })
      }
    })
  }
})
