import { expect } from "chai";
import { ethers, network } from "hardhat";
import { getTokenByChainAndSymbol } from "@indexcoop/tokenlists";

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

const ALCHEMY_KEY = process.env.ALCHEMY_API_KEY;
if (!ALCHEMY_KEY) throw new Error("Please set ALCHEMY_API_KEY");

// “Safe” fork blocks per chain
const blockNumbers: Record<string, number> = {
  "1": 22322000,
  "8453": 29255000,
  "42161": 328930000,
};

describe("🏭 SDK parameterized mint tests (FlashMintQuoteProvider)", function () {
  for (const [cid, products] of Object.entries(scenarios)) {
    const chainId = Number(cid);
    const rpcBase = rpcConfig[cid];
    const forkUrl = rpcBase.endsWith("/")
      ? `${rpcBase}${ALCHEMY_KEY}`
      : `${rpcBase}/${ALCHEMY_KEY}`;
    const forkBlock = blockNumbers[cid];

    describe(`🔗 chain ${chainId}`, function () {
      let flashProvider: FlashMintQuoteProvider;

      before(function () {
        const zeroExV2 = getZeroExV2SwapQuoteProvider();
        const lifi    = getLifiSwapQuoteProvider();
        flashProvider = new FlashMintQuoteProvider(forkUrl, zeroExV2, lifi);
      });

      for (const [productName, cfg] of Object.entries(products)) {
        // build a Token object for the index/set token
        const setToken = getTokenByChainAndSymbol(chainId, productName);

        describe(`  • product ${productName}`, function () {
          for (const setAmtStr of cfg.setAmounts) {
            const setAmt = wei(setAmtStr).toString();

            describe(`    – mint ${setAmtStr}`, function () {
              for (const sym of cfg.inputTokens) {
                // look up address & whale (we only need the symbol for the quote request)
                const mapEntry = (inputTokenMap as any)[cid]?.[sym];
                if (!mapEntry) {
                  throw new Error(`Missing mapping for chain ${cid} token ${sym}`);
                }

                // build a Token object for the input token
                const inputToken = getTokenByChainAndSymbol(chainId, sym);

                describe(`      • via ${sym}`, function () {
                  let quote: Awaited<ReturnType<FlashMintQuoteProvider["getQuote"]>>;

                  before(async function () {
                    // reset+fork
                    await network.provider.request({
                      method: "hardhat_reset",
                      params: [{ forking: { jsonRpcUrl: forkUrl, blockNumber: forkBlock } }],
                    });
                    await network.provider.request({ method: "evm_mine", params: [] });

                    // actually get a quote
                    const req: FlashMintQuoteRequest = {
                      chainId,
                      isMinting: true,
                      inputToken,
                      outputToken: setToken,
                      indexTokenAmount: setAmt,
                      slippage: 0.5,
                    };
                    const res = await flashProvider.getQuote(req);
                    if (!res.success) fail(`quote failed: ${res.error?.message}`);
                    quote = res.data;
                  });

                  it("returns a valid mint quote", function () {
                    expect(quote.chainId).to.equal(chainId);
                    expect(quote.isMinting).to.be.true;
                    expect(quote.contractType).to.be.oneOf([
                      FlashMintContractType.static,
                      FlashMintContractType.hyeth,
                    ]);
                    // it must quote some positive input
                    expect(quote.inputAmount).to.be.gte(0);
                    // index amount matches
                    expect(quote.indexTokenAmount.toString()).to.equal(setAmt);
                    expect(quote.slippage).to.equal(0.5);
                    // tx payload
                    expect(quote.tx.to).to.match(/^0x[0-9a-fA-F]{40}$/);
                    expect(quote.tx.data).to.be.a("string").and.not.empty;
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
