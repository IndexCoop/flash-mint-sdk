import { expect } from "chai";
import { JsonRpcProvider } from "@ethersproject/providers";
import { ethers } from "ethers";

import rpcConfig from "./rpcConfig.json";
import scenarios from "./testScenarios.json";
import inputTokenMap from "./inputTokenMap.json";

import {
  FlashMintQuoteProvider,
  FlashMintContractType,
  type FlashMintQuoteRequest,
} from "../quote/provider";

import {
  getZeroExV2SwapQuoteProvider,
  getLifiSwapQuoteProvider,
  wei,
} from "./utils";

// upstream Alchemy key for forking
const ALCHEMY_KEY = process.env.ALCHEMY_API_KEY;
if (!ALCHEMY_KEY) throw new Error("Please set ALCHEMY_API_KEY");

// drive all JSON-RPC through this local node
const LOCAL_RPC_URL = process.env.LOCAL_RPC_URL || "http://127.0.0.1:8545";
const localProvider = new JsonRpcProvider(LOCAL_RPC_URL);

// safe fork blocks
const blockNumbers: Record<string, number> = {
  "1": 22322000,
  "8453": 29255000,
  "42161": 328930000,
};

const ERC20_ABI = ["function decimals() view returns (uint8)"];

describe("🏭 SDK parameterized mint tests (FlashMintQuoteProvider)", function () {
  for (const [cid, products] of Object.entries(scenarios)) {
    const chainId = Number(cid);
    // upstream RPC we fork from
    const upstreamRpc = rpcConfig[cid].endsWith("/")
      ? `${rpcConfig[cid]}${ALCHEMY_KEY}`
      : `${rpcConfig[cid]}/${ALCHEMY_KEY}`;
    const forkBlock = blockNumbers[cid];

    describe(`🔗 chain ${chainId}`, function () {
      let flashProvider: FlashMintQuoteProvider;

      before(function () {
        // build your FlashMintQuoteProvider against the local node
        const zeroEx = getZeroExV2SwapQuoteProvider();
        const lifi   = getLifiSwapQuoteProvider();
        flashProvider = new FlashMintQuoteProvider(
          LOCAL_RPC_URL,
          zeroEx,
          lifi
        );
      });

      for (const [productName, cfg] of Object.entries(products)) {
        const outputToken = {
          address: cfg.setToken,
          decimals: cfg.decimals,
          symbol: productName,
        };

        describe(`  • product ${productName}`, function () {
          for (const setAmtStr of cfg.setAmounts) {
            const setAmt = wei(setAmtStr).toString();

            describe(`    – mint ${setAmtStr}`, function () {
              for (const sym of cfg.inputTokens) {
                const mapEntry = (inputTokenMap as any)[cid]?.[sym];
                if (!mapEntry) {
                  throw new Error(
                    `Missing mapping for chain ${cid} token ${sym}`
                  );
                }
                const inputToken = {
                  address: mapEntry.address as string,
                  decimals: mapEntry.decimals as number,
                  symbol: sym,
                };
                const whale = mapEntry.whale as string;

                describe(`      • via ${sym}`, function () {
                  let quote: Awaited<
                    ReturnType<FlashMintQuoteProvider["getQuote"]>
                  >["data"];
                  let taker: string;

                  before(async function () {
                    // reset & fork local node
                    await localProvider.send("hardhat_reset", [
                      {
                        forking: {
                          jsonRpcUrl: upstreamRpc,
                          blockNumber: forkBlock,
                        },
                      },
                    ]);
                    await localProvider.send("evm_mine", []);

                    // impersonate the whale
                    await localProvider.send("hardhat_impersonateAccount", [
                      whale,
                    ]);

                    // pick first local account as taker
                    const accounts = await localProvider.listAccounts();
                    taker = accounts[0];

                    // compute a big maxIn = setAmt * 10^decimals
                    const erc20 = new ethers.Contract(
                      inputToken.address,
                      ERC20_ABI,
                      localProvider
                    );
                    const dec = await erc20.decimals();
                    const maxIn = ethers.BigNumber.from(setAmt).mul(
                      ethers.BigNumber.from(10).pow(dec)
                    );

                    // build request
                    const request: FlashMintQuoteRequest = {
                      chainId,
                      isMinting: true,
                      inputToken,
                      outputToken,
                      indexTokenAmount: setAmt,
                      inputTokenAmount: maxIn.toString(),
                      slippage: 0.5,
                      taker,
                    };

                    // fetch via the local fork
                    const result = await flashProvider.getQuote(request);
                    if (!result.success) {
                      fail(`Quote failed: ${result.error?.message}`);
                    }
                    quote = result.data;
                  });

                  it("returns a valid mint quote", function () {
                    expect(quote.chainId).to.equal(chainId);
                    expect(quote.isMinting).to.be.true;
                    expect(quote.contractType).to.be.oneOf([
                      FlashMintContractType.static,
                      FlashMintContractType.hyeth,
                    ]);
                    expect(quote.inputAmount).to.be.gte(0);
                    expect(quote.indexTokenAmount.toString()).to.equal(setAmt);
                    expect(quote.slippage).to.equal(0.5);
                    expect(quote.tx.to).to.match(/^0x[0-9a-fA-F]{40}$/);
                    expect(quote.tx.data).to.be.a("string").and.not.empty;
                  });

                  it.skip("executes on-chain mint", async function () {
                    // to actually execute:
                    // 1) have `whale` send tokens to `taker`
                    // 2) send `quote.tx` via a signer connected to LOCAL_RPC_URL
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
