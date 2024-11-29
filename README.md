# Flash Mint SDK v3

The Flash Mint SDK provides easy to use functions to integrate flash minting for
Index's products.

## The Contracts

To find out more about the contracts, go to Index's smart contracts [repo](https://github.com/IndexCoop/index-coop-smart-contracts/tree/master/contracts/exchangeIssuance).

This SDK currently supports the contracts listed [here](./src/constants/contracts.ts).
Check out the [utility](./src/utils/contracts.ts) functions for easily obtaining
the correct addresses and contracts on Mainnet, Arbitrum and Base.

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

With v3, while you could still use other quote providers individually, we recommend
solely using the `FlashMintQuoteProvider` which will do most of the guess work for you.
This provider will return the appropriate quotes for any Index token, automatically
selecting the correct FlashMint contract for you - as well as preparing the call data.

```typescript
import { FlashMintQuoteProvider, QuoteToken } from '@indexcoop/flash-mint-sdk'

// Input/output token should be of type QuoteToken with the following properties
const inputToken: QuoteToken = {
  symbol: 'ETH',
  decimals: 18,
  address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
}
const outputToken: QuoteToken = {
  symbol: 'icETH',
  decimals: 18,
  address: '0x7C07F7aBe10CE8e33DC6C5aD68FE033085256A84',
}

// Add a RPC URL e.g. from Alchemy
const rpcUrl = ''
// Use the 0x swap quote provider configured to your needs e.g. custom base url -
// or provide your own adapter implementing the `SwapQuoteProvider` interface
const zeroexSwapQuoteProvider = new ZeroExSwapQuoteProvider()
const quoteProvider = new FlashMintQuoteProvider(
  rpcUrl,
  zeroexSwapQuoteProvider
)
const quote = await quoteProvider.getQuote({
  isMinting: true,
  inputToken,
  outputToken,
  indexTokenAmount: wei(1).toString(),
  slippage: 0.1,
})
```

The returned quote is an object including meta data but most importantly the `inputOutputAmount`
which is the quote for the given request\* and a `tx` object which is a tx object
basically ready to be send.

```typescript
interface FlashMintQuote {
  chainId: number
  contractType: FlashMintContractType
  contract: string
  isMinting: boolean
  inputToken: QuoteToken
  outputToken: QuoteToken
  inputAmount: BigNumber
  outputAmount: BigNumber
  indexTokenAmount: BigNumber
  inputOutputAmount: BigNumber
  slippage: number
  tx: TransactionRequest
}
```

\* for minting this will be the input amount, for redeeming the output amount

## Flashmint

To execute the flash minting of an Index token for convenience use the `tx` object
returned by the `FlashMintQuoteProvider`.

```typescript
...
const quoteProvider = new FlashMintQuoteProvider(
      rpcUrl,
      zeroexSwapQuoteProvider
    )
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
Use the [utility](./src/utils/contracts.ts) functions for easily obtaining
the correct addresses and contracts.

## Develoment

### .env vars

When adding new .env vars do not forget to update the [publish.yml](.github/workflows/publish.yml)

### Adding a new Index token

0. add a test for determining the correct issuance module [here](./src/utils/issuanceModules.test.ts)
1. add a test for determining the correct contract [here](./src/utils/contracts.test.ts)
2. if there is a new FlashMint contract, add it as described [below](#adding-a-new-contract)
3. add symbol to `function getContractType(token: string)` in [src/quote/provider/utils.ts](./src/quote//provider/utils.ts) and add a test
4. additionally, add a test in [tests](./src/tests/)

### Adding a new contract

0. add the contract address in [constants](./src/constants/contracts.ts)
1. add appropriate getters and tests in [utils/contracts](./src/utils/contracts.ts)
2. add a new [builder](./src/flashmint/builders/) and [quote provider](./src/quote/)
3. The new quote provider has to be integrated into the [FlashMintQuoteProvider](./src/quote/indexQuoteProvider.ts)

## Contributing

We will encourage contributing and open dialog how to improve the SDK. How though
is still TBD. 🚧 In the meantime just open an issue.

## License

Copyright © 2024 Index Coop.

[MIT License](./LICENSE)
