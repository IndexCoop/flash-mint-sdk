import { JsonRpcProvider } from '@ethersproject/providers'
import { getTokenByChainAndSymbol } from '@indexcoop/tokenlists'
import { expect } from 'chai'
import { ETH } from 'constants/tokens'
import { ethers } from 'ethers'

import inputTokenMap from './inputTokenMap.json'
import rpcConfig from './rpcConfig.json'
import scenarios from './testScenarios.json'

import {
  FlashMintContractType,
  FlashMintQuoteProvider,
  type FlashMintQuoteRequest,
} from '../quote/provider'

import {
  getLifiSwapQuoteProvider,
  getZeroExV2SwapQuoteProvider,
  wei,
} from './utils'

// upstream Alchemy key for forking
const ALCHEMY_KEY = process.env.ALCHEMY_API_KEY
if (!ALCHEMY_KEY) throw new Error('Please set ALCHEMY_API_KEY')

// drive all JSON-RPC through this local node
const LOCAL_RPC_URL = process.env.LOCAL_RPC_URL || 'http://127.0.0.1:8545'
const localProvider = new JsonRpcProvider(LOCAL_RPC_URL)

// safe fork blocks
const blockNumbers: Record<string, number> = {
  '1': 22322000,
  '8453': 29255000,
  '42161': 328930000,
}

// Minimal ERC20 ABI for decimals + transfer + approve + balanceOf
const ERC20_ABI = [
  'function decimals() view returns (uint8)',
  'function transfer(address to,uint256 amount) returns (bool)',
  'function approve(address spender,uint256 amount) returns (bool)',
  'function balanceOf(address owner) view returns (uint256)',
]

describe('🏭 SDK parameterized mint & redeem tests (FlashMintQuoteProvider)', () => {
  for (const [cid, products] of Object.entries(scenarios)) {
    const chainId = Number(cid)
    const upstreamRpc = rpcConfig[cid].endsWith('/')
      ? `${rpcConfig[cid]}${ALCHEMY_KEY}`
      : `${rpcConfig[cid]}/${ALCHEMY_KEY}`
    const forkBlock = blockNumbers[cid]

    describe(`🔗 chain ${chainId}`, () => {
      let flashProvider: FlashMintQuoteProvider

      before(() => {
        const zeroEx = getZeroExV2SwapQuoteProvider()
        const lifi = getLifiSwapQuoteProvider()
        flashProvider = new FlashMintQuoteProvider(LOCAL_RPC_URL, zeroEx, lifi)
      })

      for (const [productSymbol, cfg] of Object.entries(products)) {
        // derive the SetToken info from the symbol
        const indexToken = getTokenByChainAndSymbol(chainId, productSymbol)
        console.log('indexToken', indexToken)

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
                  sym === 'ETH' ? ETH : getTokenByChainAndSymbol(chainId, sym)
                const whale = mapEntry.whale as string

                describe(`      • via ${sym}`, () => {
                  let mintQuote: Awaited<
                    ReturnType<FlashMintQuoteProvider['getQuote']>
                  >['data']
                  let taker: string
                  let maxIn: ethers.BigNumber
                  let erc20Whale: ethers.Contract
                  let setTokenContract: ethers.Contract
                  let mintedAmount: ethers.BigNumber

                  before(async () => {
                    // reset & fork
                    await localProvider.send('hardhat_reset', [
                      {
                        forking: {
                          jsonRpcUrl: upstreamRpc,
                          blockNumber: forkBlock,
                        },
                      },
                    ])
                    await localProvider.send('evm_mine', [])

                    // impersonate whale and pick taker
                    await localProvider.send('hardhat_impersonateAccount', [
                      whale,
                    ])
                    ;[taker] = await localProvider.listAccounts()

                    // compute maxIn = setAmt × exchangeRate ÷ 10^(18 − inputDecimals)
                    const tokenContract = new ethers.Contract(
                      inputToken.address,
                      ERC20_ABI,
                      localProvider,
                    )
                    const dec =
                      sym === 'ETH' ? 18 : await tokenContract.decimals()
                    const bnSet = ethers.BigNumber.from(setAmt)
                    // Supports up to 0.001 units of precision on the exchange rate
                    const ratePrecision = 1000
                    const rate = ethers.BigNumber.from(
                      exchangeRate * ratePrecision,
                    )
                    const scale = ethers.BigNumber.from(10).pow(18 - dec)
                    maxIn = bnSet.mul(rate).div(ratePrecision).div(scale)

                    // fetch mint quote
                    const request: FlashMintQuoteRequest = {
                      chainId,
                      isMinting: true,
                      inputToken,
                      outputToken: indexToken,
                      indexTokenAmount: setAmt,
                      inputTokenAmount: maxIn.toString(),
                      slippage: 0.5,
                      taker,
                    }
                    const result = await flashProvider.getQuote(request)
                    if (!result.success)
                      fail(`Quote failed: ${result.error?.message}`)
                    mintQuote = result.data

                    if (sym !== 'ETH') {
                      // prepare contracts
                      erc20Whale = new ethers.Contract(
                        inputToken.address,
                        ERC20_ABI,
                        localProvider.getSigner(whale),
                      )
                    }
                    setTokenContract = new ethers.Contract(
                      indexToken.address,
                      ERC20_ABI,
                      localProvider.getSigner(taker),
                    )
                  })

                  it('returns a valid mint quote', () => {
                    expect(mintQuote.chainId).to.equal(chainId)
                    expect(mintQuote.isMinting).to.be.true
                    expect(mintQuote.contractType).to.be.oneOf([
                      FlashMintContractType.static,
                      FlashMintContractType.hyeth,
                    ])
                    expect(
                      ethers.BigNumber.from(mintQuote.inputAmount),
                    ).to.be.gte(0)
                    expect(mintQuote.indexTokenAmount).to.equal(setAmt)
                    expect(mintQuote.slippage).to.equal(0.5)
                    expect(mintQuote.tx.to).to.match(/^0x[0-9a-fA-F]{40}$/)
                    expect(mintQuote.tx.data).to.be.a('string').and.not.empty
                  })

                  describe('      ✓ execute mint', () => {
                    let balanceBefore: ethers.BigNumber

                    before(async () => {
                      // approve & execute
                      const takerSigner = localProvider.getSigner(taker)

                      if (sym !== 'ETH') {
                        // fund taker
                        await erc20Whale.transfer(taker, maxIn)

                        const erc20Taker = erc20Whale.connect(takerSigner)
                        await erc20Taker.approve(mintQuote.tx.to, maxIn)
                      }

                      balanceBefore = await setTokenContract.balanceOf(taker)
                      const tx = await takerSigner.sendTransaction({
                        to: mintQuote.tx.to,
                        data: mintQuote.tx.data!,
                        value: mintQuote.tx.value
                          ? ethers.BigNumber.from(mintQuote.tx.value)
                          : undefined,
                        gasLimit: 5_000_000,
                      })
                      await tx.wait()
                    })

                    it('minted correct amount', async () => {
                      const balanceAfter =
                        await setTokenContract.balanceOf(taker)
                      mintedAmount = balanceAfter.sub(balanceBefore)
                      expect(mintedAmount).to.equal(
                        ethers.BigNumber.from(setAmt),
                      )
                    })

                    describe('      ◦ redeem', () => {
                      let redeemQuote: Awaited<
                        ReturnType<FlashMintQuoteProvider['getQuote']>
                      >['data']
                      let postRedeemSetBalance: ethers.BigNumber

                      before(async () => {
                        // fetch redeem quote
                        const redeemReq: FlashMintQuoteRequest = {
                          chainId,
                          isMinting: false,
                          inputToken: indexToken,
                          outputToken: inputToken,
                          indexTokenAmount: setAmt,
                          inputTokenAmount: mintedAmount.toString(),
                          slippage: 0.5,
                          taker,
                        }
                        const res = await flashProvider.getQuote(redeemReq)
                        if (!res.success)
                          fail(`Redeem quote failed: ${res.error?.message}`)
                        redeemQuote = res.data

                        // approve set tokens to redeem
                        const takerSigner = localProvider.getSigner(taker)
                        await setTokenContract
                          .connect(takerSigner)
                          .approve(redeemQuote.tx.to, mintedAmount)

                        const inBefore =
                          sym === 'ETH'
                            ? await takerSigner.getBalance()
                            : await new ethers.Contract(
                                inputToken.address,
                                ERC20_ABI,
                                localProvider,
                              ).balanceOf(taker)

                        const tx = await takerSigner.sendTransaction({
                          to: redeemQuote.tx.to,
                          data: redeemQuote.tx.data!,
                          value: redeemQuote.tx.value
                            ? ethers.BigNumber.from(redeemQuote.tx.value)
                            : undefined,
                          gasLimit: 5_000_000,
                        })
                        await tx.wait()

                        // record balances before & after
                        postRedeemSetBalance =
                          await setTokenContract.balanceOf(taker)

                        const inAfter =
                          sym === 'ETH'
                            ? await takerSigner.getBalance()
                            : await new ethers.Contract(
                                inputToken.address,
                                ERC20_ABI,
                                localProvider,
                              ).balanceOf(taker)

                        expect(inAfter).to.be.gt(inBefore)
                      })

                      it('burned the set tokens', () => {
                        expect(postRedeemSetBalance).to.equal(
                          ethers.BigNumber.from(0),
                        )
                      })
                    })
                  })
                })
              }
            })
          }
        })
      }
    })
  }
})
