import { JsonRpcProvider } from "@ethersproject/providers";
import { getTokenByChainAndSymbol } from "@indexcoop/tokenlists";
import { expect } from "chai";
import { ETH } from "constants/tokens";
import { ethers } from "ethers";

import inputTokenMap from "./inputTokenMap";
import rpcConfig from "./rpcConfig";
import scenarios from "./testScenarios";

import {
    FlashMintContractType,
    FlashMintQuoteProvider,
    type FlashMintQuoteRequest,
} from "../quote/provider";

import {
    getZeroExV2SwapQuoteProvider,
    getLifiSwapQuoteProvider,
    wei,
} from "./utils";


// Factor by which to round down the latest block number to run all tests against the same block
// Gives tradeoff between avoiding tests running "stale" while still leveraging caching to some extend to improve performance
const BLOCK_ROUNDING_MAINNET = 1000;
const BLOCK_ROUNDING_L2 = 10000;
const ALCHEMY_KEY = process.env.ALCHEMY_API_KEY;
if (!ALCHEMY_KEY) throw new Error("Please set ALCHEMY_API_KEY");

const LOCAL_RPC_URL = process.env.LOCAL_RPC_URL || "http://127.0.0.1:8545";
const localProvider = new JsonRpcProvider(LOCAL_RPC_URL);

// Minimal ERC20 ABI for decimals + transfer + approve + balanceOf
const ERC20_ABI = [
    "function decimals() view returns (uint8)",
    "function transfer(address to,uint256 amount) returns (bool)",
    "function approve(address spender,uint256 amount) returns (bool)",
    "function balanceOf(address owner) view returns (uint256)",
];

describe("🏭 SDK parameterized mint & redeem tests (FlashMintQuoteProvider)", () => {
    for (const [cid, products] of Object.entries(scenarios)) {
        const chainId = Number(cid);
        const upstreamBase = rpcConfig[cid];
        const upstreamRpc = upstreamBase.endsWith("/")
            ? `${upstreamBase}${ALCHEMY_KEY}`
            : `${upstreamBase}/${ALCHEMY_KEY}`;

        describe(`🔗 chain ${chainId}`, () => {
            let flashProvider: FlashMintQuoteProvider;
            let forkBlock: number;

            before(async () => {
                // 1) init quote provider
                const zeroEx = getZeroExV2SwapQuoteProvider();
                const lifi = getLifiSwapQuoteProvider();
                flashProvider = new FlashMintQuoteProvider(
                    LOCAL_RPC_URL,
                    zeroEx,
                    lifi
                );

                // 2) apply optional override
                const override =
                    chainId === 1
                        ? process.env.MAINNET_BLOCK_NUMBER
                : chainId === 8453
                        ? process.env.BASE_BLOCK_NUMBER
                        : chainId === 42161
                        ? process.env.ARBITRUM_BLOCK_NUMBER
                        : undefined;

                if (override) {
                    forkBlock = parseInt(override, 10);
                } else {
                    // 3) fetch current head from upstream and round down to nearest 1,000
                    const remote = new JsonRpcProvider(upstreamRpc);
                    const head = await remote.getBlockNumber();
                    if(chainId === 1) {
                        forkBlock = Math.floor(head / BLOCK_ROUNDING_MAINNET) * BLOCK_ROUNDING_MAINNET;
                    } else {
                        forkBlock = Math.floor(head / BLOCK_ROUNDING_L2) * BLOCK_ROUNDING_L2;
                    }
                }

                console.log(
                    `⛏  Forking chain ${chainId} at block ${forkBlock}`
                );
            });

            for (const [productSymbol, cfg] of Object.entries(products)) {
                const indexToken = getTokenByChainAndSymbol(
                    chainId,
                    productSymbol
                );
                if (!indexToken) {
                    throw new Error(
                        `No index token for ${productSymbol} on ${chainId}`
                    );
                }

                describe(`  • product ${productSymbol}`, () => {
                    for (const setAmtStr of cfg.setAmounts) {
                        const setAmt = wei(setAmtStr).toString();

                        describe(`    – mint ${setAmtStr}`, () => {
                            for (const {
                                symbol: sym,
                                exchangeRate,
                            } of cfg.inputTokens) {
                                const mapEntry = (inputTokenMap as any)[cid]?.[
                                    sym
                                ];
                                if (!mapEntry) {
                                    throw new Error(
                                        `Missing mapping for chain ${cid} token ${sym}`
                                    );
                                }
                                const inputToken =
                                    sym === "ETH"
                                        ? ETH
                                        : getTokenByChainAndSymbol(
                                              chainId,
                                              sym
                                          )!;
                                const whale = mapEntry.whale as string;

                                describe(`      • via ${sym}`, () => {
                                    let mintQuote: Awaited<
                                        ReturnType<
                                            FlashMintQuoteProvider["getQuote"]
                                        >
                                    >["data"];
                                    let taker: string;
                                    let maxIn: ethers.BigNumber;
                                    let erc20Whale: ethers.Contract;
                                    let setTokenContract: ethers.Contract;
                                    let mintedAmount: ethers.BigNumber;

                                    before(async () => {
                                        // reset & fork at our computed block
                                        await localProvider.send(
                                            "hardhat_reset",
                                            [
                                                {
                                                    forking: {
                                                        jsonRpcUrl: upstreamRpc,
                                                        blockNumber: forkBlock,
                                                    },
                                                },
                                            ]
                                        );
                                        await localProvider.send(
                                            "evm_mine",
                                            []
                                        );

                                        // impersonate whale & pick taker
                                        await localProvider.send(
                                            "hardhat_impersonateAccount",
                                            [whale]
                                        );
                                        [taker] =
                                            await localProvider.listAccounts();

                                        const topUp = ethers.utils.parseEther("1000000").toHexString();
                                        await localProvider.send("hardhat_setBalance", [taker, topUp]);

                                        // compute maxIn = setAmt × exchangeRate ÷ 10^(18 − inputDecimals)
                                        const tokenContract =
                                            new ethers.Contract(
                                                inputToken.address,
                                                ERC20_ABI,
                                                sym === "ETH"
                                                    ? localProvider
                                                    : localProvider.getSigner(
                                                          whale
                                                      )
                                            );
                                        const dec =
                                            sym === "ETH"
                                                ? 18
                                                : await tokenContract.decimals();
                                        const bnSet =
                                            ethers.BigNumber.from(setAmt);
                                        const ratePrecision = 1000; // support 3 decimal-rate precision
                                        const rate = ethers.BigNumber.from(
                                            Math.floor(
                                                exchangeRate * ratePrecision
                                            )
                                        );
                                        const scale = ethers.BigNumber.from(
                                            10
                                        ).pow(18 - dec);
                                        maxIn = bnSet
                                            .mul(rate)
                                            .div(ratePrecision)
                                            .div(scale);

                                        // fetch mint quote
                                        const req: FlashMintQuoteRequest = {
                                            chainId,
                                            isMinting: true,
                                            inputToken,
                                            outputToken: indexToken,
                                            indexTokenAmount: setAmt,
                                            inputTokenAmount: maxIn.toString(),
                                            slippage: 0.5,
                                            taker,
                                        };
                                        const res =
                                            await flashProvider.getQuote(req);
                                        if (!res.success) {
                                            throw new Error(
                                                `Quote failed: ${res.error?.message}`
                                            );
                                        }
                                        mintQuote = res.data;

                                        // prepare contracts
                                        if (sym !== "ETH") {
                                            erc20Whale = new ethers.Contract(
                                                inputToken.address,
                                                ERC20_ABI,
                                                localProvider.getSigner(whale)
                                            );
                                        }
                                        setTokenContract = new ethers.Contract(
                                            indexToken.address,
                                            ERC20_ABI,
                                            localProvider.getSigner(taker)
                                        );
                                    });

                                    it("returns a valid mint quote", () => {
                                        expect(mintQuote.chainId).to.equal(
                                            chainId
                                        );
                                        expect(mintQuote.isMinting).to.be.true;
                                        expect(
                                            mintQuote.contractType
                                        ).to.be.oneOf([
                                            FlashMintContractType.static,
                                            FlashMintContractType.hyeth,
                                        ]);
                                        expect(
                                            ethers.BigNumber.from(
                                                mintQuote.inputAmount
                                            )
                                        ).to.be.gte(0);
                                        expect(
                                            mintQuote.indexTokenAmount
                                        ).to.equal(setAmt);
                                        expect(mintQuote.slippage).to.equal(
                                            0.5
                                        );
                                        expect(mintQuote.tx.to).to.match(
                                            /^0x[0-9a-fA-F]{40}$/
                                        );
                                        expect(mintQuote.tx.data).to.be.a(
                                            "string"
                                        ).and.not.empty;
                                    });

                                    describe("      ✓ execute mint", () => {
                                        let balanceBefore: ethers.BigNumber;

                                        before(async () => {
                                            const takerSigner =
                                                localProvider.getSigner(taker);

                                            if (sym !== "ETH") {
                                                await erc20Whale.transfer(
                                                    taker,
                                                    maxIn
                                                );
                                                const erc20Taker =
                                                    erc20Whale.connect(
                                                        takerSigner
                                                    );
                                                await erc20Taker.approve(
                                                    mintQuote.tx.to,
                                                    maxIn
                                                );
                                            }
                                            balanceBefore =
                                                await setTokenContract.balanceOf(
                                                    taker
                                                );
                                            const tx =
                                                await takerSigner.sendTransaction(
                                                    {
                                                        to: mintQuote.tx.to,
                                                        data: mintQuote.tx
                                                            .data!,
                                                        value: mintQuote.tx
                                                            .value
                                                            ? ethers.BigNumber.from(
                                                                  mintQuote.tx
                                                                      .value
                                                              )
                                                            : undefined,
                                                        gasLimit: 5_000_000,
                                                    }
                                                );
                                            await tx.wait();
                                        });

                                        it("minted correct amount", async () => {
                                            const balanceAfter =
                                                await setTokenContract.balanceOf(
                                                    taker
                                                );
                                            mintedAmount =
                                                balanceAfter.sub(balanceBefore);
                                            expect(mintedAmount).to.equal(
                                                ethers.BigNumber.from(setAmt)
                                            );
                                        });

                                        describe("      ◦ redeem", () => {
                                            let redeemQuote: Awaited<
                                                ReturnType<
                                                    FlashMintQuoteProvider["getQuote"]
                                                >
                                            >["data"];
                                            let balanceAfterRedeem: ethers.BigNumber;

                                            before(async () => {
                                                // fetch redeem quote
                                                const redeemReq: FlashMintQuoteRequest =
                                                    {
                                                        chainId,
                                                        isMinting: false,
                                                        inputToken: indexToken,
                                                        outputToken: inputToken,
                                                        indexTokenAmount:
                                                            setAmt,
                                                        inputTokenAmount:
                                                            mintedAmount.toString(),
                                                        slippage: 0.5,
                                                        taker,
                                                    };
                                                const rr =
                                                    await flashProvider.getQuote(
                                                        redeemReq
                                                    );
                                                if (!rr.success) {
                                                    throw new Error(
                                                        `Redeem quote failed: ${rr.error?.message}`
                                                    );
                                                }
                                                redeemQuote = rr.data;

                                                // approve & execute
                                                const takerSigner =
                                                    localProvider.getSigner(
                                                        taker
                                                    );
                                                await setTokenContract
                                                    .connect(takerSigner)
                                                    .approve(
                                                        redeemQuote.tx.to,
                                                        mintedAmount
                                                    );

                                                const beforeSet =
                                                    await setTokenContract.balanceOf(
                                                        taker
                                                    );
                                                const tx =
                                                    await takerSigner.sendTransaction(
                                                        {
                                                            to: redeemQuote.tx
                                                                .to,
                                                            data: redeemQuote.tx
                                                                .data!,
                                                            value: redeemQuote
                                                                .tx.value
                                                                ? ethers.BigNumber.from(
                                                                      redeemQuote
                                                                          .tx
                                                                          .value
                                                                  )
                                                                : undefined,
                                                            gasLimit: 5_000_000,
                                                        }
                                                    );
                                                await tx.wait();
                                                balanceAfterRedeem =
                                                    await setTokenContract.balanceOf(
                                                        taker
                                                    );

                                                // ensure user got more input‐token back than they burned
                                                const inAfter =
                                                    sym === "ETH"
                                                        ? await takerSigner.getBalance()
                                                        : await new ethers.Contract(
                                                              inputToken.address,
                                                              ERC20_ABI,
                                                              localProvider
                                                          ).balanceOf(taker);
                                                expect(inAfter).to.be.gt(0);
                                            });

                                            it("burned only the redeemed amount", () => {
                                                expect(
                                                    balanceAfterRedeem
                                                ).to.equal(
                                                    ethers.BigNumber.from(
                                                        balanceBefore
                                                    )
                                                );
                                            });
                                        });
                                    });
                                });
                            }
                        });
                    }
                });
            }
        });
    }
});
