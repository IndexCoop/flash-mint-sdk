import { BigNumber } from '@ethersproject/bignumber'
import type { ZeroExV2SwapQuoteProvider } from 'quote/swap/adapters/zeroex_v2';
import { getTokenByChainAndSymbol, isAddressEqual } from '@indexcoop/tokenlists';

const MAX_NUM_THREADS = 4;

type QuoteResult = {
  sellAmount: BigNumber;
  buyAmount: BigNumber;
};

async function getQuote(
  provider: ZeroExV2SwapQuoteProvider,
  chainId: number,
  sellToken: string,
  buyToken: string,
  sellAmount: BigNumber,
  sellEntireBalance: boolean
): Promise<QuoteResult | null> {
  const response = await provider.getPriceQuote({
    chainId,
    inputToken: sellToken,
    outputToken: buyToken,
    slippage: 0.5,
    inputAmount: sellAmount.toString(),
    sellEntireBalance,
  });

  if (!response) return null;
  return {
    sellAmount: BigNumber.from(response.inputAmount),
    buyAmount: BigNumber.from(response.outputAmount),
  };
}

export async function getSellAmountParallel(
  chainId: number,
  sellToken: string,
  buyToken: string,
  minSellAmount: BigNumber,
  maxSellAmount: BigNumber,
  targetBuyAmount: BigNumber,
  minBuyAmount: BigNumber,
  maxBuyAmount: BigNumber,
  swapQuoteProvider: ZeroExV2SwapQuoteProvider,
  maxDepth = 5
): Promise<BigNumber | null> {
  const isStEth = isAddressEqual(sellToken, getTokenByChainAndSymbol(1, 'stETH').address);
  return await searchSellAmount(
    chainId,
    sellToken,
    buyToken,
    minSellAmount,
    maxSellAmount,
    targetBuyAmount,
    minBuyAmount,
    maxBuyAmount,
    swapQuoteProvider,
    isStEth,
    0,
    maxDepth
  );
}

async function searchSellAmount(
  chainId: number,
  sellToken: string,
  buyToken: string,
  minSell: BigNumber,
  maxSell: BigNumber,
  targetBuyAmount: BigNumber,
  minBuy: BigNumber,
  maxBuy: BigNumber,
  provider: ZeroExV2SwapQuoteProvider,
  sellEntireBalance: boolean,
  depth: number,
  maxDepth: number
): Promise<BigNumber | null> {
  if (depth > maxDepth) return null;

  const intervals: BigNumber[] = [];
  const step = maxSell.sub(minSell).div(MAX_NUM_THREADS);
  for (let i = 0; i <= MAX_NUM_THREADS; i++) {
    intervals.push(minSell.add(step.mul(i)));
  }

  const quotes = await Promise.all(
    intervals.map((amt) =>
      getQuote(provider, chainId, sellToken, buyToken, amt, sellEntireBalance).catch(() => null)
    )
  );

  // 1. Return first sellAmount within target buyAmount range
  for (const quote of quotes) {
    if (!quote) continue;
    if (quote.buyAmount.gte(minBuy) && quote.buyAmount.lt(maxBuy)) {
      return quote.sellAmount;
    }
  }

  // 2. Find lowest quote with buyAmount >= minBuy
  let candidateIdx = quotes.findIndex((q) =>  q?.buyAmount.gte(minBuy));
  if (candidateIdx === -1) {
    // fallback to lowest sellAmount
    candidateIdx = quotes.findIndex((q) => q !== null);
    if (candidateIdx === -1) return null; // all quotes failed
  }

  const quote = quotes[candidateIdx];
  if (!quote) return null;

  const overEstimationFactor = targetBuyAmount.mul(BigNumber.from(1e9)).div(quote.buyAmount);
  const newSellAmount = quote.sellAmount.mul(overEstimationFactor).div(BigNumber.from(1e9));

  const delta = quote.sellAmount.sub(newSellAmount);
  const newMin = newSellAmount.sub(delta);
  const newMax = quote.sellAmount;

  return await searchSellAmount(
    chainId,
    sellToken,
    buyToken,
    newMin,
    newMax,
    targetBuyAmount,
    minBuy,
    maxBuy,
    provider,
    sellEntireBalance,
    depth + 1,
    maxDepth
  );
}

export async function getSellAmount(
  chainId: number,
  sellToken: string,
  buyToken: string,
  targetBuyAmount: BigNumber,
  minBuyAmount: BigNumber,
  maxBuyAmount: BigNumber,
  maxSellAmount: BigNumber,
  swapQuoteProvider: ZeroExV2SwapQuoteProvider,
  maxRequests = 10,
) {
  if (targetBuyAmount.gt(maxBuyAmount) || targetBuyAmount.lt(minBuyAmount)) {
    console.warn('targetBuyAmount not in range')
    return null
  }

  const isStEth = isAddressEqual(
    sellToken,
    getTokenByChainAndSymbol(1, 'stETH').address,
  )
  let response = await swapQuoteProvider.getPriceQuote({
    chainId,
    inputToken: sellToken,
    outputToken: buyToken,
    slippage: 0.5,
    inputAmount: maxSellAmount.toString(),
    sellEntireBalance: !isStEth,
  })
  if (!response) {
    console.warn('Initial price response is null for getSellAmount()')
    return null
  }

  let sellAmount = BigNumber.from(response?.inputAmount)
  let buyAmount = BigNumber.from(response?.outputAmount)
  if (buyAmount.lt(minBuyAmount)) {
    console.warn(
      `Buy amount obtained for maxSellAmount (${buyAmount.toString()}) is less than specified minBuyAmount ${minBuyAmount.toString()}`,
    )
    return null
  }
  let requestNum = 0
  while (
    (buyAmount.lt(minBuyAmount) || buyAmount.gt(maxBuyAmount)) &&
    requestNum < maxRequests
  ) {
    sellAmount = sellAmount.mul(targetBuyAmount).div(buyAmount)
    response = await swapQuoteProvider.getPriceQuote({
      chainId,
      inputToken: sellToken,
      outputToken: buyToken,
      slippage: 0.5,
      inputAmount: sellAmount.toString(),
      sellEntireBalance: !isStEth,
    })
    if (response) {
      buyAmount = BigNumber.from(response.outputAmount)
      sellAmount = BigNumber.from(response.inputAmount)
    } else {
      console.warn('Response is null for getSellAmount()')
      return null
    }
    requestNum++
  }
  if (buyAmount.lt(minBuyAmount) || buyAmount.gt(maxBuyAmount)) {
    console.warn('Exceeded max requests')
    return null
  }
  return sellAmount
}
