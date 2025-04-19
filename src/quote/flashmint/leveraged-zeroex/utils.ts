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

export enum SellAmountErrorCode {
  INVALID_TARGET_BUY_AMOUNT = 'INVALID_TARGET_BUY_AMOUNT',
  START_SELL_AMOUNT_NOT_IN_RANGE = 'START_SELL_AMOUNT_NOT_IN_RANGE',
  PRICE_QUOTE_NULL = 'PRICE_QUOTE_NULL',
  BUY_AMOUNT_OUT_OF_RANGE = 'BUY_AMOUNT_OUT_OF_RANGE',
  SELL_AMOUNT_GREATER_THAN_MAX = 'SELL_AMOUNT_GREATER_THAN_MAX',
  MAX_REQUESTS_EXCEEDED = 'MAX_REQUESTS_EXCEEDED',
}

export class SellAmountError extends Error {
  public code: SellAmountErrorCode
  constructor(code: SellAmountErrorCode, message: string) {
    super(message)
    this.name = 'SellAmountError'
    this.code = code
  }
}

export async function getSellAmount(
  chainId: number,
  sellToken: string,
  buyToken: string,
  targetBuyAmount: BigNumber,
  minBuyAmount: BigNumber,
  maxBuyAmount: BigNumber,
  startSellAmount: BigNumber,
  maxSellAmount: BigNumber,
  swapQuoteProvider: ZeroExV2SwapQuoteProvider,
  maxRequests = 10,
) {
  if (targetBuyAmount.gt(maxBuyAmount) || targetBuyAmount.lt(minBuyAmount)) {
    throw new SellAmountError(
      SellAmountErrorCode.INVALID_TARGET_BUY_AMOUNT,
      `Target buy amount (${targetBuyAmount.toString()}) is not within the valid range (${minBuyAmount.toString()} - ${maxBuyAmount.toString()}).`,
    )
  }

  if (startSellAmount.gt(maxSellAmount)) {
    throw new SellAmountError(
      SellAmountErrorCode.START_SELL_AMOUNT_NOT_IN_RANGE,
      `Start sell amount not in range: ${startSellAmount}; maxSellAmount: ${maxSellAmount}`,
    )
  }

  const isStEth = isAddressEqual(
    sellToken,
    getTokenByChainAndSymbol(1, 'stETH').address,
  )

  // Get initial price quote
  let response = await swapQuoteProvider.getPriceQuote({
    chainId,
    inputToken: sellToken,
    outputToken: buyToken,
    slippage: 0.5,
    inputAmount: startSellAmount.toString(),
    sellEntireBalance: !isStEth,
  })

  if (!response) {
    throw new SellAmountError(
      SellAmountErrorCode.PRICE_QUOTE_NULL,
      'Initial price quote is null for getSellAmount().',
    )
  }

  let sellAmount = BigNumber.from(response.inputAmount)
  let buyAmount = BigNumber.from(response.outputAmount)

  if (sellAmount.gt(maxSellAmount)) {
    throw new SellAmountError(
      SellAmountErrorCode.SELL_AMOUNT_GREATER_THAN_MAX,
      `Error sellAmount ${sellAmount.toString()} is larger than maxSellAmount (${maxSellAmount.toString()}) - corresponding buy amount: (${buyAmount.toString()})`,
    )
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

    if (!response) {
      throw new SellAmountError(
        SellAmountErrorCode.PRICE_QUOTE_NULL,
        'Price quote response is null during iteration in getSellAmount().',
      )
    }

    buyAmount = BigNumber.from(response.outputAmount)
    sellAmount = BigNumber.from(response.inputAmount)

    if (sellAmount.gt(maxSellAmount)) {
      throw new SellAmountError(
        SellAmountErrorCode.SELL_AMOUNT_GREATER_THAN_MAX,
        `Error sellAmount ${sellAmount.toString()} is larger than maxSellAmount (${maxSellAmount.toString()}) - corresponding buy amount: (${buyAmount.toString()})`,
      )
    }

    requestNum++
  }

  if (buyAmount.lt(minBuyAmount) || buyAmount.gt(maxBuyAmount)) {
    throw new SellAmountError(
      SellAmountErrorCode.MAX_REQUESTS_EXCEEDED,
      `Exceeded max allowed requests (${maxRequests}).`,
    )
  }

  return sellAmount
}
