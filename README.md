# Flash Mint SDK

The SDK provides helper functions for using Index's Flash Mint contracts from your app.

:warning: Disclaimer: the SDK should be treated as **beta**.<br />

## The Contracts

To find out more about the contracts, go to Index's smart contracts [repo](https://github.com/IndexCoop/index-coop-smart-contracts/tree/master/contracts/exchangeIssuance).

This SDK currently supports:

- ExchangeIssuanceLeveraged (FlashMintLeveraged)
- ExchangeIssuanceZeroEx (FlashMintZeroEx)

The contract addresses can be found [here](./src/constants/contracts.ts). Check out the [utility](./src/utils/contracts.ts) functions for easily obtaining the correct addresses and contracts.

## Install

```
$ npm i @indexcoop/flash-mint-sdk
or
$ yarn add @indexcoop/flash-mint-sdk
```

## Limitations

A limitation to be aware of with the contracts (especially for getting quotes), is that they can only mint or redeem an exact amount of a Set token. :warning: The SDK currently does not support finding these amounts e.g. compared to other quotes. You're welcome to approach us though, to see how we do it in our frontend.

Also, please note that (Set) tokens have to be approved on the contracts before they can be used with any of the contract's functions.

## Usage

### Quotes

To fetch a quote for `FlashMintLeveraged` use the following code.

```typescript
import {
  getFlashMintLeveragedQuote,
  ZeroExApi,
} from '@indexcoop/flash-mint-sdk'

// Input/output token should be of type QuoteToken with the following properties
const inputToken = {
      symbol: "ETH",
      decimals: 18,
      address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    }
const outputToken = { ... }
// Slippage should be defined in % e.g. 0.1 or 3%
const slippage = 0.5
// For quotes the provider can be read-only
const provider: JsonRpcProvider = ...
// Define no base url to use the free default (watch rate limits!)
const zeroExApi = new ZeroExApi()
const quote = await getFlashMintLeveragedQuote(
  inputToken,
  outputToken,
  setTokenAmount,   // How much of the Set token should be minted/redeemed
  isMinting,        // Set here whether the Set token should be minted/redeemed
  slippage,
  zeroExApi,
  provider,
  chainId ?? 1
)
```

Fetching quotes for `FlashMintZeroEx` works similar to the example above.

```typescript
const quote = await getFlashMintZeroExQuote(
  inputToken,
  outputToken,
  setTokenAmount,
  isMinting,
  slippage,
  zeroExApi,
  provider,
  chainId
)
```

The quote functions will return objects of the following types (or null on error). Depending on minting/redeeming the `inputOutputTokenAmount` will be the quote for the input or ouput token amount that is needed to mint/redeem the exact set amount `setTokenAmount`. The other properties are data that will be used as input for the trade functions.

```typescript
export interface FlashMintLeveragedQuote {
  swapDataDebtCollateral: SwapData
  swapDataPaymentToken: SwapData
  inputOutputTokenAmount: BigNumber
  setTokenAmount: BigNumber
}

export interface FlashMintZeroExQuote {
  componentQuotes: string[]
  inputOutputTokenAmount: BigNumber
  setTokenAmount: BigNumber
}
```

### Mint/Redeem Tokens

To mint or redeem Set tokens, use the following functions. The functions will execute and return an object of type `TransactionResponse` (ethers.js).

#### FlashMintLeveraged

```typescript
import {
  FlashMintLeveraged,
  getFlashMintLeveragedContract,
  SwapData,
} from '@indexcoop/flash-mint-sdk'

// For these functions you'll need a provider with a signer
const contract = getFlashMintLeveragedContract(provider?.getSigner(), chainId)
// To make sure you get the correct FlashMintLeveraged contract (there are now
// multiple deployments), use this function which will get the correct contract
// based on the given index.
const contract = getFlashMintLeveragedContractForToken(tokenSymbol, provider.getSigner(), chainId)
// Pass the contract to the flash mint class
const flashMint = new FlashMintLeveraged(contract)

// To mint a Set token from ETH
const mintTx = await flashMint.mintExactSetFromETH(
  setTokenAddress,
  setTokenAmount,
  debtCollateralSwapData,   // from the quote
  inputOutputSwapData,      // from the quote
  inputOutputLimit,         // from the quote
  { gasLimit: ... }
)

// To mint a Set token from any other approved token
const mintTx = await flashMint.mintExactSetFromERC20(
  setTokenAddress,
  setTokenAmount,
  inputTokenAddress,
  inputOutputLimit,
  debtCollateralSwapData,
  inputOutputSwapData,
  { gasLimit: ... }
)

// To redeem a Set token for ETH
const redeemTx = await flashMint.redeemExactSetForETH(
  setTokenAddress,
  setTokenAmount,
  inputOutputLimit,
  debtCollateralSwapData,
  inputOutputSwapData,
  { gasLimit: ... }
)

// To redeem a Set token for any other approved token
const redeemTx = await flashMint.redeemExactSetForERC20(
  setTokenAddress,
  setTokenAmount,
  outputTokenAddress,
  inputOutputLimit,
  debtCollateralSwapData,
  inputOutputSwapData,
  { gasLimit: ... }
```

#### FlashMintZeroEx

```typescript
import {
  FlashMintZeroEx,
  getFlashMintZeroExContract,
  getFlashMintZeroExContractForToken,
  getIssuanceModule,
} from '@indexcoop/flash-mint-sdk'

// For these functions you'll need a provider with a signer
const contract = getFlashMintZeroExContract(provider.getSigner(), chainId)
// To make sure you get the correct FlashMintZeroEx (there are now multiple deployments),
// use this function which will get the correct contract based on the given index.
const contract = getFlashMintZeroExContractForToken(tokenSymbol, provider.getSigner(), chainId)
// Pass the contract to the flash mint class
const flashMint = new FlashMintZeroEx(contract)
// Determine the correct issuance module (helper function)
const issuanceModule = getIssuanceModule(tokenSymbol, chainId)

// To mint a Set token from ETH
const mintTx = await flashMint.mintExactSetFromETH(
  setTokenAddress,
  setTokenAmount,
  quote.componentQuotes,  // the component quotes that were fetched via the quote function earlier
  issuanceModule.address,
  issuanceModule.isDebtIssuance,
  quoteData.inputTokenAmount,
  { gasLimit: ... }
)

// To mint a Set token from any other approved token
const mintTx = await flashMint.mintExactSetFromToken(
  outputTokenAddress,
  inputTokenAddress,
  setTokenAmount,
  quote.inputOuputTokenAmount,
  quote.componentQuotes,
  issuanceModule.address,
  issuanceModule.isDebtIssuance,
  { gasLimit: ... }
)

// To redeem a Set token for ETH
const redeemTx = await flashMint.redeemExactSetForETH(
  inputTokenAddress,
  setTokenAmount,
  quote.inputOuputTokenAmount,
  quote.componentQuotes,
  issuanceModule.address,
  issuanceModule.isDebtIssuance,
  { gasLimit: ... }
)

// To redeem a Set token for any other approved token
const redeemTx = await flashMint.redeemExactSetForToken(
  inputTokenAddress,
  outputTokenAddress,
  setTokenAmount,
  quote.inputOuputTokenAmount,
  quote.componentQuotes,
  issuanceModule.address,
  issuanceModule.isDebtIssuance,
  { gasLimit: ... }
)
```

## Gas

Determining gas for the contracts is not easy - as they are very complex (by using other contracts) during execution.

Do not rely on ethers.js `estimateGas` - as the documentation states itsself: an estimate may not be accurate.

Currently the following values for `gasLimit` seem to work pretty good:

- FlashMintLeveraged: `1800000`
- FlashMintZeroEx: `5000000` (over double of what `estimateGas` usually predicts)

Feel free to approach us for our implementation on the frontend.

## Contributing

We will encourage contributing and open dialog how to improve the SDK. How though is still TBD. 🚧

```

$ npm run commit

```

REQUIRED: Due to the use of [semantic-release](https://www.npmjs.com/package/semantic-release-cli) for deploying to npm's registry, we require commits to be formatted in a specific way. This is made easy by the above npm script. If your commit doesn't use the above command for styling, it won't be picked up by semantic-release for publishing.

### .env vars

When adding new .env vars do not forget to update the [publish.yml](.github/workflows/publish.yml)

## License

Copyright © 2022 Index Coop.

[MIT License](./LICENSE)
