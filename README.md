# Flash Mint SDK v3

The Flash Mint SDK provides easy to use functions to integrate flash minting for
Index's products.

## The Contracts

To find out more about the contracts, go to Index's smart contracts [repo](https://github.com/IndexCoop/index-coop-smart-contracts/tree/master/contracts/exchangeIssuance).

This SDK currently supports the contracts listed [here](./src/constants/contracts.ts).

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
  address: '0xc4506022Fb8090774E8A628d5084EED61D9B99Ee',
}

// Add a RPC URL e.g. from Alchemy
const rpcUrl = ''
// Use the 0x v2 swap quote provider configured with your API key or provide your 
// own adapter implementing the `SwapQuoteProviderV2` interface.
const zeroexV2SwapQuoteProvider = new ZeroExV2SwapQuoteProvider()
// As 0x v2 does not allow swap quotes by defining outputAmounts any longer we're
// now added a second swap quote provider for that - Li.Fi (provide API key).
const lifiSwapQuoteProvider = new LiFiSwapQuoteProvider(apiKey, integrator)
const quoteProvider = new FlashMintQuoteProvider(
  rpcUrl,
  zeroexV2SwapQuoteProvider,
  lifiSwapQuoteProvider
)
// Option 1 - get a quote for a specified index token amount
const quote = await quoteProvider.getQuote({
  chainId: 1,
  isMinting: true,
  inputToken,
  outputToken,
  indexTokenAmount: wei(1).toString(),
  inputTokenAmount: wei(1).toString(),
  slippage: 0.1,
})
// Option 2 - get a quote for a fixed input amount (am approx. indexTokenAmount 
// should still be added to the request).
await quoteProvider.getFixedInputQuote({
  chainId: 1,
  isMinting: true,
  inputToken,
  outputToken,
  indexTokenAmount: wei(1).toString(),
  inputTokenAmount: wei(1).toString(),
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
      zeroexV2SwapQuoteProvider,
      lifiSwapQuoteProvider
    )
const quote = await quoteProvider.getQuote({...})
let tx = quote.tx
const gasEstimate = await provider.estimateGas(tx)
tx.gasLimit = gasEstimate
const res = await signer.sendTransaction(tx)
console.log(res.hash)
```

## Development

### .env vars

When adding new .env vars do not forget to update the [publish.yml](.github/workflows/publish.yml)

### Adding a new Index token

0. add a test for determining the correct issuance module (only if using 0x) [here](./src/utils/issuance-modules.test.ts)
1. add a test for determining the correct contract [here](./src/utils/contracts.test.ts)
2. if there is a new FlashMint contract, add it as described [below](#adding-a-new-contract)
3. add symbol to `function getContractType(token: string)` in [src/quote/provider/utils.ts](./src/quote//provider/utils.ts) and add a test
4. additionally, add a test in [tests](./src/tests/)

### Adding a new contract

0. add the contract address in [constants](./src/constants/contracts.ts)
1. add appropriate getters and tests in [utils/contracts](./src/utils/contracts.ts)
2. add a new [builder](./src/flashmint/builders/) and [quote provider](./src/quote/)
3. The new quote provider has to be integrated into the [FlashMintQuoteProvider](./src/quote/indexQuoteProvider.ts)

## Testing

```
// run all tests
npm run test:hardhat src/tests/e2e/index.test.ts

// run tests for a specific chain
npm run test:hardhat src/tests/e2e/index.test.ts -- --grep "chain 1"

// run tests for a specific product exiting on first failure
npm run test:hardhat src/tests/e2e/index.test.ts -- --bail --grep "hyETH"
```

## Debugging

```
cast run --rpc-url http://127.0.0.1:8545/ 0x8ea51dd6cec3e1bea98b143715fe9a1375ca7e01c120f0065cb4ef6c0e0dd23a // mainnet
cast run --rpc-url http://127.0.0.1:8453/ 0x362c844b7a1ecd5feb14e389eccd68d34373281892e5a6d387131ed9bfef9b01 // base
cast run --rpc-url http://127.0.0.1:8548/ 0x5434cd90c4b06faed9d77d256e5d569b94c1ef88217d25e82bc6cf1b84153b69 // arbitrum
```

## Contributing

We will encourage contributing and open dialog how to improve the SDK. How though
is still TBD. 🚧 In the meantime just open an issue.

## License

Copyright © 2025 Index Coop.

[MIT License](./LICENSE)
