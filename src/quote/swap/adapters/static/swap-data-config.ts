import { getTokenByChainAndSymbol } from '@indexcoop/tokenlists'
import type { SwapData, SwapDataV5 } from 'utils'
import { zeroAddress } from 'viem'

// Three flavours of static-adapter config entry.
//   'leveragedV5' (default — no `kind` field): the legacy leveraged FlashMint
//      shape with swapDataDebtForCollateral + swapDataInputToken.
//   'dexV5':                                   FlashMintDexV5 (non-leveraged)
//      shape with per-component WETH↔component swaps and an input/output ↔ WETH
//      bridge. Used for the post-disengage Morpho leverage products that the
//      leveraged flashmints reject with "TOO MANY COMPONENTS".
//   'aaveDeleveredRedeem':                     AaveV3DeleveredRedeemer
//      (single-output redeemer for delevered Aave-collateralized SetTokens whose
//      components are aTokens with no DEX liquidity). Redemption-only.
export type LeveragedConfigEntry = {
  contract: string
  swapDataDebtForCollateral: SwapData | SwapDataV5
  swapDataInputToken: SwapData | SwapDataV5
}

export type DexV5ConfigEntry = {
  kind: 'dexV5'
  contract: 'FlashMintDexV5'
  // WETH → component, one per SetToken component, in component order.
  componentSwapDataIssue: SwapDataV5[]
  // component → WETH, one per SetToken component, in component order.
  componentSwapDataRedeem: SwapDataV5[]
  // input/output token ↔ WETH bridge. Use a noop SwapData when input/output is
  // ETH or WETH (the contract short-circuits).
  swapDataInputToWeth: SwapDataV5
  swapDataWethToInput: SwapDataV5
}

export type AaveDeleveredRedeemEntry = {
  kind: 'aaveDeleveredRedeem'
  contract: 'AaveV3DeleveredRedeemer'
  // The token the user effectively receives. For AAVE2x → AAVE; for LINK2x → LINK.
  // Used as the headline `outputToken` for SDK quotes. (For LINK2x, USDT dust is
  // also forwarded by the contract, but its value is ~$0.00 and not surfaced
  // in the quote.)
  underlyingToken: string
  // Per-set unit of the headline component (the collateral aToken), scaled to
  // 1e18-set-units. Aave V3 aTokens redeem 1:1 with underlying so this is also
  // the per-set underlying delivered. Refresh from chain at deploy time.
  // For AAVE2x:  863_285_415_590_294_069 wei aArbAAVE per 1e18 set
  // For LINK2x: 14_472_672_577_246_974_018 wei aArbLINK per 1e18 set
  unitsPerSet: bigint
}

export type StaticConfigEntry =
  | LeveragedConfigEntry
  | DexV5ConfigEntry
  | AaveDeleveredRedeemEntry

export function isDexV5Entry(e: StaticConfigEntry): e is DexV5ConfigEntry {
  return (e as DexV5ConfigEntry).kind === 'dexV5'
}

export function isAaveDeleveredRedeemEntry(
  e: StaticConfigEntry,
): e is AaveDeleveredRedeemEntry {
  return (e as AaveDeleveredRedeemEntry).kind === 'aaveDeleveredRedeem'
}

// `Exchange.None` swap. Used wherever DEXAdapterV5 needs to short-circuit a
// per-component swap (e.g. when the issuance module reports a 0-amount
// component on issue or redeem — `swapExact*` would otherwise revert inside
// the underlying router on the 0-amount call).
export const noopSwapV5: SwapDataV5 = {
  exchange: 0,
  path: [],
  fees: [],
  tickSpacing: [],
  pool: zeroAddress,
  poolIds: [],
}

const mainnet = {
  steth: getTokenByChainAndSymbol(1, 'stETH').address,
  usdc: getTokenByChainAndSymbol(1, 'USDC').address,
  usdt: getTokenByChainAndSymbol(1, 'USDT').address,
  xaut: getTokenByChainAndSymbol(1, 'XAUt').address,
  wbtc: getTokenByChainAndSymbol(1, 'WBTC').address,
  weth: getTokenByChainAndSymbol(1, 'WETH').address,
}

const base = {
  cbbtc: getTokenByChainAndSymbol(8453, 'cbBTC').address,
  usdc: getTokenByChainAndSymbol(8453, 'USDC').address,
  usol: getTokenByChainAndSymbol(8453, 'uSOL').address,
  usui: getTokenByChainAndSymbol(8453, 'uSUI').address,
  uxrp: getTokenByChainAndSymbol(8453, 'uXRP').address,
  wbtc: getTokenByChainAndSymbol(8453, 'WBTC').address,
  weth: getTokenByChainAndSymbol(8453, 'WETH').address,
  wsteth: getTokenByChainAndSymbol(8453, 'wstETH').address,
}

const arbitrum = {
  aave: getTokenByChainAndSymbol(42161, 'AAVE').address,
  arb: getTokenByChainAndSymbol(42161, 'ARB').address,
  link: getTokenByChainAndSymbol(42161, 'LINK').address,
  wbtc: getTokenByChainAndSymbol(42161, 'WBTC').address,
  weth: getTokenByChainAndSymbol(42161, 'WETH').address,
  usdc: getTokenByChainAndSymbol(42161, 'USDC').address,
  usdt0: getTokenByChainAndSymbol(42161, 'USD₮0').address,
}

// Builds a FlashMintDexV5 config entry for the post-disengage Morpho leverage
// products on Base. `collateral` is the underlying asset (uSOL/uSUI/uXRP);
// `is3x` adds the USDC dust component. `inputToken` (omitted = WETH) selects
// the input/output ↔ WETH bridge.
function dexV5Entry(
  collateral: string,
  is3x: boolean,
  baseTokens: typeof base,
  inputToken?: string,
): DexV5ConfigEntry {
  // Aerodrome SlipStream tickSpacing=200 for collateral ↔ WETH.
  const collateralFromWeth: SwapDataV5 = {
    exchange: 7,
    path: [baseTokens.weth, collateral],
    fees: [],
    tickSpacing: [200],
    pool: zeroAddress,
    poolIds: [],
  }
  const collateralToWeth: SwapDataV5 = {
    exchange: 7,
    path: [collateral, baseTokens.weth],
    fees: [],
    tickSpacing: [200],
    pool: zeroAddress,
    poolIds: [],
  }
  // Uniswap V3 0.05% USDC ↔ WETH for the 3x dust component.
  const usdcFromWeth: SwapDataV5 = {
    exchange: 3,
    path: [baseTokens.weth, baseTokens.usdc],
    fees: [500],
    tickSpacing: [],
    pool: zeroAddress,
    poolIds: [],
  }
  const usdcToWeth: SwapDataV5 = {
    exchange: 3,
    path: [baseTokens.usdc, baseTokens.weth],
    fees: [500],
    tickSpacing: [],
    pool: zeroAddress,
    poolIds: [],
  }
  const componentSwapDataIssue = is3x
    ? [collateralFromWeth, usdcFromWeth]
    : [collateralFromWeth]
  const componentSwapDataRedeem = is3x
    ? [collateralToWeth, usdcToWeth]
    : [collateralToWeth]
  // Bridge for the user's input/output token. WETH input short-circuits to
  // noopSwap. USDC and cbBTC bridge via Uniswap V3 0.05%.
  let swapDataInputToWeth: SwapDataV5 = noopSwapV5
  let swapDataWethToInput: SwapDataV5 = noopSwapV5
  if (inputToken && inputToken !== baseTokens.weth) {
    swapDataInputToWeth = {
      exchange: 3,
      path: [inputToken, baseTokens.weth],
      fees: [500],
      tickSpacing: [],
      pool: zeroAddress,
      poolIds: [],
    }
    swapDataWethToInput = {
      exchange: 3,
      path: [baseTokens.weth, inputToken],
      fees: [500],
      tickSpacing: [],
      pool: zeroAddress,
      poolIds: [],
    }
  }
  return {
    kind: 'dexV5',
    contract: 'FlashMintDexV5',
    componentSwapDataIssue,
    componentSwapDataRedeem,
    swapDataInputToWeth,
    swapDataWethToInput,
  }
}

export const SwapDataConfig: Readonly<{
  [chainId: number]: Readonly<{
    [indexTokenSymbol: string]: Readonly<{
      [inputToken: string]: Readonly<StaticConfigEntry>
    }>
  }>
}> = {
  1: {
    'ETH2X': {
      [mainnet.weth]: {
        contract: 'FlashMintLeveragedAaveFL',
        swapDataDebtForCollateral: {
          path: [mainnet.usdc, mainnet.weth],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [mainnet.weth],
          fees: [],
          exchange: 0,
          pool: zeroAddress,
        },
      },
      [mainnet.usdc]: {
        contract: 'FlashMintLeveragedAaveFL',
        swapDataDebtForCollateral: {
          path: [mainnet.usdc, mainnet.weth],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [mainnet.usdc, mainnet.weth],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
      },
      [mainnet.wbtc]: {
        contract: 'FlashMintLeveragedAaveFL',
        swapDataDebtForCollateral: {
          path: [mainnet.usdc, mainnet.weth],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [mainnet.wbtc, mainnet.weth],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
      },
    },
    'ETH3x': {
      [mainnet.weth]: {
        contract: 'FlashMintLeveragedAaveFL',
        swapDataDebtForCollateral: {
          path: [mainnet.usdt, mainnet.weth],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [mainnet.weth],
          fees: [],
          exchange: 0,
          pool: zeroAddress,
        },
      },
      [mainnet.usdt]: {
        contract: 'FlashMintLeveragedAaveFL',
        swapDataDebtForCollateral: {
          path: [mainnet.usdt, mainnet.weth],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [mainnet.usdt, mainnet.weth],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
      },
      [mainnet.usdc]: {
        contract: 'FlashMintLeveragedAaveFL',
        swapDataDebtForCollateral: {
          path: [mainnet.usdt, mainnet.weth],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [mainnet.usdc, mainnet.weth],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
      },
      [mainnet.wbtc]: {
        contract: 'FlashMintLeveragedAaveFL',
        swapDataDebtForCollateral: {
          path: [mainnet.usdt, mainnet.weth],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [mainnet.wbtc, mainnet.weth],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
      },
    },
    'BTC2X': {
      [mainnet.weth]: {
        contract: 'FlashMintLeveragedAaveFL',
        swapDataDebtForCollateral: {
          path: [mainnet.usdc, mainnet.wbtc],
          fees: [3000],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [mainnet.weth, mainnet.wbtc],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
      },
      [mainnet.usdc]: {
        contract: 'FlashMintLeveragedAaveFL',
        swapDataDebtForCollateral: {
          path: [mainnet.usdc, mainnet.wbtc],
          fees: [3000],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [mainnet.usdc, mainnet.wbtc],
          fees: [3000],
          exchange: 3,
          pool: zeroAddress,
        },
      },
      [mainnet.wbtc]: {
        contract: 'FlashMintLeveragedAaveFL',
        swapDataDebtForCollateral: {
          path: [mainnet.usdc, mainnet.wbtc],
          fees: [3000],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [mainnet.wbtc],
          fees: [],
          exchange: 3,
          pool: zeroAddress,
        },
      },
    },
    'BTC3x': {
      [mainnet.weth]: {
        contract: 'FlashMintLeveragedAaveFL',
        swapDataDebtForCollateral: {
          path: [mainnet.usdt, mainnet.wbtc],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [mainnet.weth, mainnet.wbtc],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
      },
      [mainnet.usdt]: {
        contract: 'FlashMintLeveragedAaveFL',
        swapDataDebtForCollateral: {
          path: [mainnet.usdt, mainnet.wbtc],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [mainnet.usdt, mainnet.wbtc],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
      },
      [mainnet.usdc]: {
        contract: 'FlashMintLeveragedAaveFL',
        swapDataDebtForCollateral: {
          path: [mainnet.usdt, mainnet.wbtc],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [mainnet.usdc, mainnet.wbtc],
          fees: [3000],
          exchange: 3,
          pool: zeroAddress,
        },
      },
      [mainnet.wbtc]: {
        contract: 'FlashMintLeveragedAaveFL',
        swapDataDebtForCollateral: {
          path: [mainnet.usdt, mainnet.wbtc],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [mainnet.wbtc],
          fees: [],
          exchange: 3,
          pool: zeroAddress,
        },
      },
    },
    'GOLD3x': {
      [mainnet.weth]: {
        contract: 'FlashMintLeveragedAaveFL',
        swapDataDebtForCollateral: {
          path: [mainnet.usdt, mainnet.xaut],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [mainnet.weth, mainnet.wbtc, mainnet.xaut],
          fees: [3000, 3000],
          exchange: 3,
          pool: zeroAddress,
        },
      },
      [mainnet.usdt]: {
        contract: 'FlashMintLeveragedAaveFL',
        swapDataDebtForCollateral: {
          path: [mainnet.usdt, mainnet.xaut],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [mainnet.usdt, mainnet.xaut],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
      },
      [mainnet.usdc]: {
        contract: 'FlashMintLeveragedAaveFL',
        swapDataDebtForCollateral: {
          path: [mainnet.usdt, mainnet.xaut],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [mainnet.usdc, mainnet.usdt, mainnet.xaut],
          fees: [100, 500],
          exchange: 3,
          pool: zeroAddress,
        },
      },
      [mainnet.wbtc]: {
        contract: 'FlashMintLeveragedAaveFL',
        swapDataDebtForCollateral: {
          path: [mainnet.usdt, mainnet.xaut],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [mainnet.wbtc, mainnet.xaut],
          fees: [3000],
          exchange: 3,
          pool: zeroAddress,
        },
      },
      [mainnet.xaut]: {
        contract: 'FlashMintLeveragedAaveFL',
        swapDataDebtForCollateral: {
          path: [mainnet.usdt, mainnet.xaut],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [mainnet.xaut],
          fees: [],
          exchange: 0,
          pool: zeroAddress,
        },
      },
    },
    'icETH': {
      [mainnet.weth]: {
        contract: 'ExchangeIssuanceLeveraged',
        swapDataDebtForCollateral: {
          path: ['0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', mainnet.steth],
          fees: [],
          exchange: 4,
          pool: '0xDC24316b9AE028F1497c275EB9192a3Ea0f67022',
        },
        swapDataInputToken: {
          path: ['0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', mainnet.steth],
          fees: [],
          exchange: 4,
          pool: '0xDC24316b9AE028F1497c275EB9192a3Ea0f67022',
        },
      },
    },
  },
  8453: {
    'ETH2X': {
      [base.usdc]: {
        contract: 'FlashMintLeveragedMorphoAaveLM',
        swapDataDebtForCollateral: {
          path: [base.usdc, base.weth],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
          poolIds: [],
          tickSpacing: [],
        },
        swapDataInputToken: {
          path: [base.usdc, base.weth],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
          poolIds: [],
          tickSpacing: [],
        },
      },
      [base.cbbtc]: {
        contract: 'FlashMintLeveragedMorphoAaveLM',
        swapDataDebtForCollateral: {
          path: [base.usdc, base.weth],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
          poolIds: [],
          tickSpacing: [],
        },
        swapDataInputToken: {
          path: [base.cbbtc, base.weth],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
          poolIds: [],
          tickSpacing: [],
        },
      },
      [base.weth]: {
        contract: 'FlashMintLeveragedMorphoAaveLM',
        swapDataDebtForCollateral: {
          path: [base.usdc, base.weth],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
          poolIds: [],
          tickSpacing: [],
        },
        swapDataInputToken: {
          path: [],
          fees: [],
          exchange: 3,
          pool: zeroAddress,
          poolIds: [],
          tickSpacing: [],
        },
      },
    },
    'ETH3X': {
      [base.usdc]: {
        contract: 'FlashMintLeveragedMorphoAaveLM',
        swapDataDebtForCollateral: {
          path: [base.usdc, base.weth],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
          poolIds: [],
          tickSpacing: [],
        },
        swapDataInputToken: {
          path: [base.usdc, base.weth],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
          poolIds: [],
          tickSpacing: [],
        },
      },
      [base.cbbtc]: {
        contract: 'FlashMintLeveragedMorphoAaveLM',
        swapDataDebtForCollateral: {
          path: [base.usdc, base.weth],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
          poolIds: [],
          tickSpacing: [],
        },
        swapDataInputToken: {
          path: [base.cbbtc, base.weth],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
          poolIds: [],
          tickSpacing: [],
        },
      },
      [base.weth]: {
        contract: 'FlashMintLeveragedMorphoAaveLM',
        swapDataDebtForCollateral: {
          path: [base.usdc, base.weth],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
          poolIds: [],
          tickSpacing: [],
        },
        swapDataInputToken: {
          path: [],
          fees: [],
          exchange: 3,
          pool: zeroAddress,
          poolIds: [],
          tickSpacing: [],
        },
      },
    },
    'BTC2X': {
      [base.usdc]: {
        contract: 'FlashMintLeveragedMorphoAaveLM',
        swapDataDebtForCollateral: {
          path: [base.usdc, base.cbbtc],
          fees: [],
          exchange: 7,
          poolIds: [],
          pool: zeroAddress,
          tickSpacing: [100],
        },
        swapDataInputToken: {
          path: [base.usdc, base.cbbtc],
          fees: [],
          exchange: 7,
          poolIds: [],
          pool: zeroAddress,
          tickSpacing: [100],
        },
      },
      [base.weth]: {
        contract: 'FlashMintLeveragedMorphoAaveLM',
        swapDataDebtForCollateral: {
          path: [base.usdc, base.cbbtc],
          fees: [],
          exchange: 7,
          poolIds: [],
          pool: zeroAddress,
          tickSpacing: [100],
        },
        swapDataInputToken: {
          path: [base.weth, base.cbbtc],
          fees: [],
          exchange: 7,
          poolIds: [],
          pool: zeroAddress,
          tickSpacing: [100],
        },
      },
      [base.cbbtc]: {
        contract: 'FlashMintLeveragedMorphoAaveLM',
        swapDataDebtForCollateral: {
          path: [base.usdc, base.cbbtc],
          fees: [],
          exchange: 7,
          poolIds: [],
          pool: zeroAddress,
          tickSpacing: [100],
        },
        swapDataInputToken: {
          path: [],
          fees: [],
          exchange: 0,
          poolIds: [],
          pool: zeroAddress,
          tickSpacing: [],
        },
      },
    },
    'BTC3X': {
      [base.usdc]: {
        contract: 'FlashMintLeveragedMorphoAaveLM',
        swapDataDebtForCollateral: {
          path: [base.usdc, base.cbbtc],
          fees: [],
          exchange: 7,
          poolIds: [],
          pool: zeroAddress,
          tickSpacing: [100],
        },
        swapDataInputToken: {
          path: [base.usdc, base.cbbtc],
          fees: [],
          exchange: 7,
          poolIds: [],
          pool: zeroAddress,
          tickSpacing: [100],
        },
      },
      [base.weth]: {
        contract: 'FlashMintLeveragedMorphoAaveLM',
        swapDataDebtForCollateral: {
          path: [base.usdc, base.cbbtc],
          fees: [],
          exchange: 7,
          poolIds: [],
          pool: zeroAddress,
          tickSpacing: [100],
        },
        swapDataInputToken: {
          path: [base.weth, base.cbbtc],
          fees: [],
          exchange: 7,
          poolIds: [],
          pool: zeroAddress,
          tickSpacing: [100],
        },
      },
      [base.cbbtc]: {
        contract: 'FlashMintLeveragedMorphoAaveLM',
        swapDataDebtForCollateral: {
          path: [base.usdc, base.cbbtc],
          fees: [],
          exchange: 7,
          poolIds: [],
          pool: zeroAddress,
          tickSpacing: [100],
        },
        swapDataInputToken: {
          path: [],
          fees: [],
          exchange: 0,
          poolIds: [],
          pool: zeroAddress,
          tickSpacing: [],
        },
      },
    },
    // Post-disengage Morpho leverage products are routed through FlashMintDexV5
    // (non-leveraged FlashMint with Aerodrome SlipStream support). uSOL/uSUI/uXRP
    // collateral ↔ WETH via Aerodrome SlipStream tickSpacing=200; USDC dust on 3x
    // products ↔ WETH via Uniswap V3 0.05% fee tier.
    'uSOL2x': {
      [base.weth]: dexV5Entry(base.usol, false, base),
      [base.usdc]: dexV5Entry(base.usol, false, base, base.usdc),
      [base.cbbtc]: dexV5Entry(base.usol, false, base, base.cbbtc),
    },
    'uSOL3x': {
      [base.weth]: dexV5Entry(base.usol, true, base),
      [base.usdc]: dexV5Entry(base.usol, true, base, base.usdc),
      [base.cbbtc]: dexV5Entry(base.usol, true, base, base.cbbtc),
    },
    'uSUI2x': {
      [base.weth]: dexV5Entry(base.usui, false, base),
      [base.usdc]: dexV5Entry(base.usui, false, base, base.usdc),
      [base.cbbtc]: dexV5Entry(base.usui, false, base, base.cbbtc),
    },
    'uSUI3x': {
      [base.weth]: dexV5Entry(base.usui, true, base),
      [base.usdc]: dexV5Entry(base.usui, true, base, base.usdc),
      [base.cbbtc]: dexV5Entry(base.usui, true, base, base.cbbtc),
    },
    'wstETH15x': {
      [base.weth]: {
        contract: 'FlashMintLeveragedMorphoV2',
        swapDataDebtForCollateral: {
          path: [base.weth, base.wsteth],
          fees: [],
          exchange: 7,
          tickSpacing: [1],
          poolIds: [],
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [base.weth, base.wsteth],
          fees: [],
          exchange: 7,
          tickSpacing: [1],
          poolIds: [],
          pool: zeroAddress,
        },
      },
      [base.wsteth]: {
        contract: 'FlashMintLeveragedMorphoV2',
        swapDataDebtForCollateral: {
          path: [base.weth, base.wsteth],
          fees: [],
          exchange: 7,
          tickSpacing: [1],
          poolIds: [],
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [],
          fees: [],
          exchange: 0,
          tickSpacing: [],
          poolIds: [],
          pool: zeroAddress,
        },
      },
      [base.usdc]: {
        contract: 'FlashMintLeveragedMorphoV2',
        swapDataDebtForCollateral: {
          path: [base.weth, base.wsteth],
          fees: [],
          exchange: 7,
          tickSpacing: [1],
          poolIds: [],
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [base.usdc, base.weth, base.wsteth],
          fees: [],
          exchange: 7,
          tickSpacing: [100, 1],
          poolIds: [],
          pool: zeroAddress,
        },
      },
      [base.cbbtc]: {
        contract: 'FlashMintLeveragedMorphoV2',
        swapDataDebtForCollateral: {
          path: [base.weth, base.wsteth],
          fees: [],
          exchange: 7,
          tickSpacing: [1],
          poolIds: [],
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [base.cbbtc, base.weth, base.wsteth],
          fees: [],
          exchange: 7,
          poolIds: [],
          pool: zeroAddress,
          tickSpacing: [100, 1],
        },
      },
    },
    'uXRP2x': {
      [base.weth]: dexV5Entry(base.uxrp, false, base),
      [base.usdc]: dexV5Entry(base.uxrp, false, base, base.usdc),
      [base.cbbtc]: dexV5Entry(base.uxrp, false, base, base.cbbtc),
    },
    'uXRP3x': {
      [base.weth]: dexV5Entry(base.uxrp, true, base),
      [base.usdc]: dexV5Entry(base.uxrp, true, base, base.usdc),
      [base.cbbtc]: dexV5Entry(base.uxrp, true, base, base.cbbtc),
    },
    'iETH1x': {
      [base.usdc]: {
        contract: 'FlashMintLeveragedMorphoAaveLM',
        swapDataDebtForCollateral: {
          path: [base.weth, base.usdc],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
          poolIds: [],
          tickSpacing: [],
        },
        swapDataInputToken: {
          path: [],
          fees: [],
          exchange: 0,
          pool: zeroAddress,
          poolIds: [],
          tickSpacing: [],
        },
      },
      [base.weth]: {
        contract: 'FlashMintLeveragedMorphoAaveLM',
        swapDataDebtForCollateral: {
          path: [base.weth, base.usdc],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
          poolIds: [],
          tickSpacing: [],
        },
        swapDataInputToken: {
          path: [base.weth, base.usdc],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
          poolIds: [],
          tickSpacing: [],
        },
      },
      [base.cbbtc]: {
        contract: 'FlashMintLeveragedMorphoAaveLM',
        swapDataDebtForCollateral: {
          path: [base.weth, base.usdc],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
          poolIds: [],
          tickSpacing: [],
        },
        swapDataInputToken: {
          path: [base.cbbtc, base.usdc],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
          poolIds: [],
          tickSpacing: [],
        },
      },
    },
    'iETH2x': {
      [base.usdc]: {
        contract: 'FlashMintLeveragedMorphoAaveLM',
        swapDataDebtForCollateral: {
          path: [base.weth, base.usdc],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
          poolIds: [],
          tickSpacing: [],
        },
        swapDataInputToken: {
          path: [],
          fees: [],
          exchange: 0,
          pool: zeroAddress,
          poolIds: [],
          tickSpacing: [],
        },
      },
      [base.weth]: {
        contract: 'FlashMintLeveragedMorphoAaveLM',
        swapDataDebtForCollateral: {
          path: [base.weth, base.usdc],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
          poolIds: [],
          tickSpacing: [],
        },
        swapDataInputToken: {
          path: [base.weth, base.usdc],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
          poolIds: [],
          tickSpacing: [],
        },
      },
      [base.cbbtc]: {
        contract: 'FlashMintLeveragedMorphoAaveLM',
        swapDataDebtForCollateral: {
          path: [base.weth, base.usdc],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
          poolIds: [],
          tickSpacing: [],
        },
        swapDataInputToken: {
          path: [base.cbbtc, base.usdc],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
          poolIds: [],
          tickSpacing: [],
        },
      },
    },
    'iBTC1x': {
      [base.usdc]: {
        contract: 'FlashMintLeveragedMorphoAaveLM',
        swapDataDebtForCollateral: {
          path: [base.cbbtc, base.usdc],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
          poolIds: [],
          tickSpacing: [],
        },
        swapDataInputToken: {
          path: [],
          fees: [],
          exchange: 0,
          pool: zeroAddress,
          poolIds: [],
          tickSpacing: [],
        },
      },
      [base.weth]: {
        contract: 'FlashMintLeveragedMorphoAaveLM',
        swapDataDebtForCollateral: {
          path: [base.cbbtc, base.usdc],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
          poolIds: [],
          tickSpacing: [],
        },
        swapDataInputToken: {
          path: [base.weth, base.usdc],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
          poolIds: [],
          tickSpacing: [],
        },
      },
      [base.cbbtc]: {
        contract: 'FlashMintLeveragedMorphoAaveLM',
        swapDataDebtForCollateral: {
          path: [base.cbbtc, base.usdc],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
          poolIds: [],
          tickSpacing: [],
        },
        swapDataInputToken: {
          path: [base.cbbtc, base.usdc],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
          poolIds: [],
          tickSpacing: [],
        },
      },
    },
    'iBTC2x': {
      [base.usdc]: {
        contract: 'FlashMintLeveragedMorphoAaveLM',
        swapDataDebtForCollateral: {
          path: [base.cbbtc, base.usdc],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
          poolIds: [],
          tickSpacing: [],
        },
        swapDataInputToken: {
          path: [],
          fees: [],
          exchange: 0,
          pool: zeroAddress,
          poolIds: [],
          tickSpacing: [],
        },
      },
      [base.weth]: {
        contract: 'FlashMintLeveragedMorphoAaveLM',
        swapDataDebtForCollateral: {
          path: [base.cbbtc, base.usdc],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
          poolIds: [],
          tickSpacing: [],
        },
        swapDataInputToken: {
          path: [base.weth, base.usdc],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
          poolIds: [],
          tickSpacing: [],
        },
      },
      [base.cbbtc]: {
        contract: 'FlashMintLeveragedMorphoAaveLM',
        swapDataDebtForCollateral: {
          path: [base.cbbtc, base.usdc],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
          poolIds: [],
          tickSpacing: [],
        },
        swapDataInputToken: {
          path: [base.cbbtc, base.usdc],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
          poolIds: [],
          tickSpacing: [],
        },
      },
    },
  },
  42161: {
    'BTC2X': {
      [arbitrum.usdc]: {
        contract: 'FlashMintLeveragedAaveFL',
        swapDataDebtForCollateral: {
          path: [arbitrum.usdc, arbitrum.weth, arbitrum.wbtc],
          fees: [500, 500],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [arbitrum.usdc, arbitrum.weth, arbitrum.wbtc],
          fees: [500, 500],
          exchange: 3,
          pool: zeroAddress,
        },
      },
      [arbitrum.weth]: {
        contract: 'FlashMintLeveragedAaveFL',
        swapDataDebtForCollateral: {
          path: [arbitrum.usdc, arbitrum.weth, arbitrum.wbtc],
          fees: [500, 500],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [arbitrum.weth, arbitrum.wbtc],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
      },
      [arbitrum.wbtc]: {
        contract: 'FlashMintLeveragedAaveFL',
        swapDataDebtForCollateral: {
          path: [arbitrum.usdc, arbitrum.weth, arbitrum.wbtc],
          fees: [500, 500],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [arbitrum.wbtc],
          fees: [],
          exchange: 0,
          pool: zeroAddress,
        },
      },
    },
    'BTC3X': {
      [arbitrum.usdc]: {
        contract: 'FlashMintLeveragedAaveFL',
        swapDataDebtForCollateral: {
          path: [arbitrum.usdc, arbitrum.weth, arbitrum.wbtc],
          fees: [500, 500],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [arbitrum.usdc, arbitrum.weth, arbitrum.wbtc],
          fees: [500, 500],
          exchange: 3,
          pool: zeroAddress,
        },
      },
      [arbitrum.weth]: {
        contract: 'FlashMintLeveragedAaveFL',
        swapDataDebtForCollateral: {
          path: [arbitrum.usdc, arbitrum.weth, arbitrum.wbtc],
          fees: [500, 500],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [arbitrum.weth, arbitrum.wbtc],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
      },
      [arbitrum.wbtc]: {
        contract: 'FlashMintLeveragedAaveFL',
        swapDataDebtForCollateral: {
          path: [arbitrum.usdc, arbitrum.weth, arbitrum.wbtc],
          fees: [500, 500],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [arbitrum.wbtc],
          fees: [],
          exchange: 0,
          pool: zeroAddress,
        },
      },
    },
    'ETH3X': {
      [arbitrum.weth]: {
        contract: 'FlashMintLeveragedAaveFL',
        swapDataDebtForCollateral: {
          path: [arbitrum.usdc, arbitrum.weth],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [arbitrum.weth],
          fees: [],
          exchange: 3,
          pool: zeroAddress,
        },
      },
      [arbitrum.usdc]: {
        contract: 'FlashMintLeveragedAaveFL',
        swapDataDebtForCollateral: {
          path: [arbitrum.usdc, arbitrum.weth],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [arbitrum.usdc, arbitrum.weth],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
      },
      [arbitrum.wbtc]: {
        contract: 'FlashMintLeveragedAaveFL',
        swapDataDebtForCollateral: {
          path: [arbitrum.usdc, arbitrum.weth],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [arbitrum.wbtc, arbitrum.weth],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
      },
    },
    'ETH2X': {
      [arbitrum.weth]: {
        contract: 'FlashMintLeveragedAaveFL',
        swapDataDebtForCollateral: {
          path: [arbitrum.usdc, arbitrum.weth],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [arbitrum.weth],
          fees: [],
          exchange: 3,
          pool: zeroAddress,
        },
      },
      [arbitrum.usdc]: {
        contract: 'FlashMintLeveragedAaveFL',
        swapDataDebtForCollateral: {
          path: [arbitrum.usdc, arbitrum.weth],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [arbitrum.usdc, arbitrum.weth],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
      },
      [arbitrum.wbtc]: {
        contract: 'FlashMintLeveragedAaveFL',
        swapDataDebtForCollateral: {
          path: [arbitrum.usdc, arbitrum.weth],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [arbitrum.wbtc, arbitrum.weth],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
      },
    },
    'BTC2xETH': {
      [arbitrum.weth]: {
        contract: 'FlashMintLeveragedAaveFL',
        swapDataDebtForCollateral: {
          path: [arbitrum.weth, arbitrum.wbtc],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [arbitrum.weth, arbitrum.wbtc],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
      },
      [arbitrum.wbtc]: {
        contract: 'FlashMintLeveragedAaveFL',
        swapDataDebtForCollateral: {
          path: [arbitrum.weth, arbitrum.wbtc],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [],
          fees: [],
          exchange: 3,
          pool: zeroAddress,
        },
      },
      [arbitrum.usdc]: {
        contract: 'FlashMintLeveragedAaveFL',
        swapDataDebtForCollateral: {
          path: [arbitrum.weth, arbitrum.wbtc],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [
            arbitrum.usdc,
            '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
            arbitrum.wbtc,
          ],
          fees: [100, 500],
          exchange: 3,
          pool: zeroAddress,
        },
      },
    },
    'ETH2xBTC': {
      [arbitrum.weth]: {
        contract: 'FlashMintLeveragedAaveFL',
        swapDataDebtForCollateral: {
          path: [arbitrum.wbtc, arbitrum.weth],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [arbitrum.weth],
          fees: [],
          exchange: 0,
          pool: zeroAddress,
        },
      },
      [arbitrum.usdc]: {
        contract: 'FlashMintLeveragedAaveFL',
        swapDataDebtForCollateral: {
          path: [arbitrum.wbtc, arbitrum.weth],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [arbitrum.usdc, arbitrum.weth],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
      },
      [arbitrum.wbtc]: {
        contract: 'FlashMintLeveragedAaveFL',
        swapDataDebtForCollateral: {
          path: [arbitrum.wbtc, arbitrum.weth],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [arbitrum.wbtc, arbitrum.weth],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
      },
    },
    'iBTC1X': {
      [arbitrum.usdc]: {
        contract: 'FlashMintLeveragedAaveFL',
        swapDataDebtForCollateral: {
          path: [arbitrum.wbtc, arbitrum.usdc],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [],
          fees: [],
          exchange: 0,
          pool: zeroAddress,
        },
      },
      [arbitrum.weth]: {
        contract: 'FlashMintLeveragedAaveFL',
        swapDataDebtForCollateral: {
          path: [arbitrum.wbtc, arbitrum.usdc],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [arbitrum.weth, arbitrum.usdc],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
      },
      [arbitrum.wbtc]: {
        contract: 'FlashMintLeveragedAaveFL',
        swapDataDebtForCollateral: {
          path: [arbitrum.wbtc, arbitrum.usdc],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [arbitrum.wbtc, arbitrum.usdc],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
      },
    },
    'iETH1X': {
      [arbitrum.usdc]: {
        contract: 'FlashMintLeveragedAaveFL',
        swapDataDebtForCollateral: {
          path: [arbitrum.weth, arbitrum.usdc],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [],
          fees: [],
          exchange: 3,
          pool: zeroAddress,
        },
      },
      [arbitrum.weth]: {
        contract: 'FlashMintLeveragedAaveFL',
        swapDataDebtForCollateral: {
          path: [arbitrum.weth, arbitrum.usdc],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [arbitrum.weth, arbitrum.usdc],
          fees: [3000],
          exchange: 3,
          pool: zeroAddress,
        },
      },
      [arbitrum.wbtc]: {
        contract: 'FlashMintLeveragedAaveFL',
        swapDataDebtForCollateral: {
          path: [arbitrum.weth, arbitrum.usdc],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [arbitrum.wbtc, arbitrum.usdc],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
      },
    },
    'ARB2x': {
      [arbitrum.usdc]: {
        contract: 'FlashMintLeveragedAaveFL',
        swapDataDebtForCollateral: {
          path: [arbitrum.usdt0, arbitrum.arb],
          fees: [3000],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [arbitrum.usdc, arbitrum.usdt0, arbitrum.arb],
          fees: [100, 3000],
          exchange: 3,
          pool: zeroAddress,
        },
      },
      [arbitrum.usdt0]: {
        contract: 'FlashMintLeveragedAaveFL',
        swapDataDebtForCollateral: {
          path: [arbitrum.usdt0, arbitrum.arb],
          fees: [3000],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [arbitrum.usdt0, arbitrum.arb],
          fees: [3000],
          exchange: 3,
          pool: zeroAddress,
        },
      },
      [arbitrum.weth]: {
        contract: 'FlashMintLeveragedAaveFL',
        swapDataDebtForCollateral: {
          path: [arbitrum.usdt0, arbitrum.arb],
          fees: [3000],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [arbitrum.weth, arbitrum.usdt0, arbitrum.arb],
          fees: [500, 3000],
          exchange: 3,
          pool: zeroAddress,
        },
      },
      [arbitrum.wbtc]: {
        contract: 'FlashMintLeveragedAaveFL',
        swapDataDebtForCollateral: {
          path: [arbitrum.usdt0, arbitrum.arb],
          fees: [3000],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [arbitrum.wbtc, arbitrum.usdt0, arbitrum.arb],
          fees: [500, 3000],
          exchange: 3,
          pool: zeroAddress,
        },
      },
      [arbitrum.arb]: {
        contract: 'FlashMintLeveragedAaveFL',
        swapDataDebtForCollateral: {
          path: [arbitrum.usdt0, arbitrum.arb],
          fees: [3000],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [arbitrum.arb],
          fees: [],
          exchange: 3,
          pool: zeroAddress,
        },
      },
    },
    // Post-disengage Aave-collateralized leverage products. Their components
    // are Aave aTokens with no DEX liquidity, so FlashMintLeveragedAaveFL (and
    // FlashMintDexV5) cannot route them. Instead the SDK targets a small
    // single-purpose AaveV3DeleveredRedeemer contract that calls
    // DebtIssuanceModuleV3.redeem and burns the resulting aTokens 1:1 for the
    // underlying via Aave V3 Pool.withdraw to the user. Redemption-only —
    // issuance is not supported (these products are deprecated).
    //
    // Single route per product: input = SetToken, output = the underlying that
    // the SetToken's collateral aToken redeems for. AAVE2x → AAVE; LINK2x →
    // LINK (LINK2x also forwards ~9150 wei dust USDT per set as a side effect,
    // not surfaced in the quote).
    'AAVE2x': {
      [arbitrum.aave]: {
        kind: 'aaveDeleveredRedeem',
        contract: 'AaveV3DeleveredRedeemer',
        underlyingToken: arbitrum.aave,
        unitsPerSet: 863285415590294069n,
      },
    },
    'LINK2x': {
      [arbitrum.link]: {
        kind: 'aaveDeleveredRedeem',
        contract: 'AaveV3DeleveredRedeemer',
        underlyingToken: arbitrum.link,
        unitsPerSet: 14472672577246974018n,
      },
    },
    'iETH2x': {
      [arbitrum.usdc]: {
        contract: 'FlashMintLeveragedAaveFL',
        swapDataDebtForCollateral: {
          path: [arbitrum.weth, arbitrum.usdc],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [],
          fees: [],
          exchange: 3,
          pool: zeroAddress,
        },
      },
      [arbitrum.weth]: {
        contract: 'FlashMintLeveragedAaveFL',
        swapDataDebtForCollateral: {
          path: [arbitrum.weth, arbitrum.usdc],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [arbitrum.weth, arbitrum.usdc],
          fees: [3000],
          exchange: 3,
          pool: zeroAddress,
        },
      },
      [arbitrum.wbtc]: {
        contract: 'FlashMintLeveragedAaveFL',
        swapDataDebtForCollateral: {
          path: [arbitrum.weth, arbitrum.usdc],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [arbitrum.wbtc, arbitrum.usdc],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
      },
    },
    'iBTC2x': {
      [arbitrum.usdc]: {
        contract: 'FlashMintLeveragedAaveFL',
        swapDataDebtForCollateral: {
          path: [arbitrum.wbtc, arbitrum.usdc],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [],
          fees: [],
          exchange: 0,
          pool: zeroAddress,
        },
      },
      [arbitrum.weth]: {
        contract: 'FlashMintLeveragedAaveFL',
        swapDataDebtForCollateral: {
          path: [arbitrum.wbtc, arbitrum.usdc],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [arbitrum.weth, arbitrum.usdc],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
      },
      [arbitrum.wbtc]: {
        contract: 'FlashMintLeveragedAaveFL',
        swapDataDebtForCollateral: {
          path: [arbitrum.wbtc, arbitrum.usdc],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [arbitrum.wbtc, arbitrum.usdc],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
      },
    },
  },
} as const
