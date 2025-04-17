import { BigNumber } from "@ethersproject/bignumber";
import { JsonRpcProvider } from "@ethersproject/providers";
import { getTokenByChainAndSymbol } from "@indexcoop/tokenlists";
import { ChainId } from "constants/chains";
import { ETH } from "constants/tokens";
import {
    type TestFactory,
    getTestFactoryZeroExV2,
    transferFromWhale,
    wei,
    wrapETH,
} from "tests/utils";

describe("wstETH15x (Base)", () => {
    const chainId = ChainId.Base;
    const indexToken = getTokenByChainAndSymbol(chainId, "wstETH15x");
    const usdc = getTokenByChainAndSymbol(chainId, "USDC");
    const weth = getTokenByChainAndSymbol(chainId, "WETH");
    let factory: TestFactory;
    beforeAll(async () => {
        factory = getTestFactoryZeroExV2(8, chainId);
    });

    test.skip("can mint with ETH", async () => {
        await factory.fetchQuote({
            chainId,
            isMinting: true,
            inputToken: ETH,
            outputToken: indexToken,
            indexTokenAmount: wei("1").toString(),
            inputTokenAmount: wei("1.1").toString(),
            slippage: 0.5,
        });
        await factory.executeTx();
    });

    [
        ["1", "5000"],
        ["10", "50000"],
    ].forEach(([setAmount, usdcAmount]) => {
        describe(`SetAmount: ${setAmount} - usdcAmount ${usdcAmount}`, () => {
            let quote: any;
            const whale = "0x621e7c767004266c8109e83143ab0Da521B650d6";
            beforeAll(async () => {
                const alchemyUrl = process.env.BASE_ALCHEMY_API;
                const localHostProvider = new JsonRpcProvider(
                    "http://localhost:8453"
                );
                // Note: Resetting fork to latest block to make sure quote is in line with state of the local fork
                await localHostProvider.send("hardhat_reset", [
                    {
                        forking: {
                            jsonRpcUrl: alchemyUrl,
                        },
                    },
                ]);
                quote = await factory.fetchQuote({
                    chainId,
                    isMinting: true,
                    inputToken: usdc,
                    outputToken: indexToken,
                    indexTokenAmount: wei(setAmount).toString(),
                    inputTokenAmount: wei(usdcAmount, 6).toString(),
                    slippage: 0.5,
                });
            });

            test.only("can obtain quote", () => {
                expect(quote != null).toBe(true);
            });

            test.skip("can mint", async () => {
                if (quote == null) {
                    throw new Error("Can't mint without quote");
                }
                await transferFromWhale(
                    whale,
                    factory.getSigner().address,
                    quote.inputOutputAmount,
                    quote.inputToken.address,
                    factory.getProvider()
                );
                await factory.executeTx();
            });
        });
    });

    test.skip("can mint with WETH", async () => {
        const quote = await factory.fetchQuote({
            chainId,
            isMinting: true,
            inputToken: weth,
            outputToken: indexToken,
            indexTokenAmount: wei("1").toString(),
            inputTokenAmount: wei("1.1").toString(),
            slippage: 0.5,
        });
        await wrapETH(
            quote.inputAmount.mul(BigNumber.from(2)),
            factory.getSigner(),
            chainId
        );
        await factory.executeTx();
    });

    test.skip("can redeem to ETH", async () => {
        await factory.fetchQuote({
            chainId,
            isMinting: false,
            inputToken: indexToken,
            outputToken: ETH,
            indexTokenAmount: wei("1").toString(),
            inputTokenAmount: wei("1").toString(),
            slippage: 0.5,
        });
        await factory.executeTx();
    });

    test.skip("can redeem to USDC", async () => {
        await factory.fetchQuote({
            chainId,
            isMinting: false,
            inputToken: indexToken,
            outputToken: usdc,
            indexTokenAmount: wei("1").toString(),
            inputTokenAmount: wei("1").toString(),
            slippage: 0.5,
        });
        await factory.executeTx();
    });
});
