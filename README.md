# Flash Mint SDK

The FlashtMint SDK provides easy to use functions to integrate flashminting for
Index's products.

## The Contracts

To find out more about the contracts, go to Index's smart contracts [repo](https://github.com/IndexCoop/index-coop-smart-contracts/tree/master/contracts/exchangeIssuance).

This SDK currently supports the contracts listed [here](./src/constants/contracts.ts).
Check out the [utility](./src/utils/contracts.ts) functions for easily obtaining
the correct addresses and contracts.

## Install

```
$ npm install @indexcoop/flash-mint-sdk
```

## Limitations

A limitation to be aware of (especially for getting quotes) is that the contracts
can only mint or redeem an exact amount of Index token.

Additionally, make sure that the (Index/Set) tokens have been approved on the
specific FlashMint contracts.

## Usage

### Quotes

In v2 we made it way easier to fetch a quote. Meet the `FlashMintQuoteProvider`.
This provider will now return the appropriate quotes for any Index token, automatically
selecting the correct FlashMint contract for you.

```typescript
import { FlashMintQuoteProvider } from '@indexcoop/flash-mint-sdk'

// Input/output token should be of type QuoteToken with the following properties
const inputToken = {
  symbol: 'ETH',
  decimals: 18,
  address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
}
const outputToken = {
  symbol: 'icETH',
  decimals: 18,
  address: '0x7C07F7aBe10CE8e33DC6C5aD68FE033085256A84',
}

const rpcProvider = new JsonRpcProvider('')
const quoteProvider = new FlashMintQuoteProvider(rpcProvider)
const quote = await quoteProvider.getQuote({
  isMinting: true,
  inputToken,
  outputToken,
  indexTokenAmount: wei(1),
  slippage: 0.1,
})
```

The returned quote is an object with meta data but most importantly the `inputOutputAmount`
which is the quote for the given request and a `tx` object which is a tx object
basically ready to be send.

```typescript
interface FlashMintQuote {
  chainId: number
  contractType: FlashMintContractType
  contract: string
  isMinting: boolean
  inputToken: QuoteToken
  outputToken: QuoteToken
  indexTokenAmount: BigNumber
  inputOutputAmount: BigNumber
  slippage: number
  tx: TransactionRequest
}
```

You can still fetch quotes for individual FlashMint contracts e.g. using the `ZeroExQuoteProvider`.

```typescript
import { QuoteToken, ZeroExQuoteProvider } from '@indexcoop/flash-mint-sdk'

// Input/output token should be of type QuoteToken with the following properties
const inputToken: QuoteToken = {
  symbol: 'ETH',
  decimals: 18,
  address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
}
const outputToken: QuoteToken = {
  symbol: 'dsETH',
  decimals: 18,
  address: '0x341c05c0E9b33C0E38d64de76516b2Ce970bB3BE',
}
const rpcProvider = new JsonRpcProvider('')
const quoteProvider = new ZeroExQuoteProvider(rpcProvider, zeroExApiV1)
const quote = await quoteProvider.getQuote({
  isMinting: true,
  inputToken,
  outputToken,
  indexTokenAmount,
  slippage: 0.1,
})
```

The quote providers for the individual FlashMint contracts will return not just
the inputOutputAmount but also the swap data/component quotes.

```typescript
interface FlashMintZeroExQuote {
  componentQuotes: string[]
  indexTokenAmount: BigNumber
  inputOutputTokenAmount: BigNumber
}
```

## Flashmint

To execute the flashminting of an Index for convenience use the `tx` object
returned by the `FlashMintQuoteProvider`.

```typescript
...
const quoteProvider = new FlashMintQuoteProvider(rpcProvider)
const quote = await quoteProvider.getQuote({...})
let tx = quote.tx
const gasEstimate = await provider.estimateGas(tx)
tx.gasLimit = gasEstimate
const res = await signer.sendTransaction(tx)
console.log(res.hash)
```

Alternatively, you can use the swap data returned by the individual providers to
construct the tx yourself which then has to be executed on the correct FlashMint
contract for that specific Index token.

## Develoment

### .env vars

When adding new .env vars do not forget to update the [publish.yml](.github/workflows/publish.yml)

### Adding a new Index token

0. add a test for determining the correct issuance module [here](./src/utils/issuanceModules.test.ts)
1. add a test for determining the correct contract [here](./src/utils/contracts.test.ts)
2. if there is a new FlashMint contract, add it [here](./src/constants/contracts.ts)
3. additionally, for new contracts add a new [builder](./src/flashmint/builders/) and [quote provider](./src/quote/)
4. a new quote provider has to be integrated in the [FlashMintQuoteProvider](./src/quote/indexQuoteProvider.ts)
5. ...

## Contributing

We will encourage contributing and open dialog how to improve the SDK. How though
is still TBD. 🚧 In the meantime just open an issue.

## License

Copyright © 2023 Index Coop.

[MIT License](./LICENSE)
