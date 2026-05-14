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
  contract: 'FlashMintAaveDelevered'
  // The output token the user receives. ETH-as-output is signalled by
  // `0xEeee…EEeE` (DEXAdapter ETH sentinel) and triggers
  // `redeemExactSetForETH` instead of `redeemExactSetForERC20`.
  outputToken: string
  // Per-component swap data, in the SetToken's component order. For each
  // component the contract first unwraps any aToken to underlying via Aave
  // Pool.withdraw, then swaps that underlying into `outputToken` via
  // DEXAdapterV3 using this swap data. Use a noopSwap (path=[]) when the
  // underlying is already the output token (the adapter short-circuits).
  componentSwapData: SwapDataV5[]
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

// Legacy bridged USDT on Arbitrum — distinct from USDT₮0. The Arbitrum LINK2x
// SetToken holds this token as a dust component, so any per-component swap
// data for LINK2x must use it on the input side of that leg.
const ARB_USDT_LEGACY = '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9'

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
    // Post-disengage Aave-collateralized leverage products. Components are Aave
    // aTokens with no DEX liquidity, so FlashMintLeveragedAaveFL rejects them
    // ("TOO MANY COMPONENTS" / "TOO MANY EQUITY POSITIONS"). Routed instead
    // through FlashMintAaveDelevered (deployed at 0x85eC…51FC), which unwraps
    // each aToken via Aave V3 Pool.withdraw and then swaps the underlying to
    // the requested output via DEXAdapterV3 using per-component swap data.
    // Redemption-only — issuance is not supported (deprecated).
    //
    // SetToken component order on-chain (verified):
    //   AAVE2x: [aArbAAVE]
    //   LINK2x: [aArbLINK, USDT-legacy 0xfd086bc7…b69fcbb9 (~9 wei dust per set)]
    //
    // Per-component swap data is FROM the underlying (after the contract's
    // aToken unwrap, or the component itself if not an aToken) TO the output
    // token. Use noopSwapV5 (path=[]) when the underlying already matches the
    // output token — DEXAdapterV3 short-circuits.
    //
    // ETH-as-output is signalled by the DEXAdapter ETH sentinel
    // (0xEeee…EEeE); the static-adapter transaction encoder picks
    // redeemExactSetForETH and reuses the WETH swap data automatically.
    'AAVE2x': {
      // → AAVE (collateral underlying = output)
      [arbitrum.aave]: {
        kind: 'aaveDeleveredRedeem',
        contract: 'FlashMintAaveDelevered',
        outputToken: arbitrum.aave,
        componentSwapData: [noopSwapV5],
      },
      // → WETH
      [arbitrum.weth]: {
        kind: 'aaveDeleveredRedeem',
        contract: 'FlashMintAaveDelevered',
        outputToken: arbitrum.weth,
        componentSwapData: [
          { path: [arbitrum.aave, arbitrum.weth], fees: [3000], exchange: 3,
            pool: zeroAddress, poolIds: [], tickSpacing: [] },
        ],
      },
      // → USDC (multi-hop AAVE → WETH → USDC)
      [arbitrum.usdc]: {
        kind: 'aaveDeleveredRedeem',
        contract: 'FlashMintAaveDelevered',
        outputToken: arbitrum.usdc,
        componentSwapData: [
          { path: [arbitrum.aave, arbitrum.weth, arbitrum.usdc], fees: [3000, 500], exchange: 3,
            pool: zeroAddress, poolIds: [], tickSpacing: [] },
        ],
      },
    },
    'LINK2x': {
      // → LINK (collateral passthrough; USDT dust swapped in via WETH)
      [arbitrum.link]: {
        kind: 'aaveDeleveredRedeem',
        contract: 'FlashMintAaveDelevered',
        outputToken: arbitrum.link,
        componentSwapData: [
          noopSwapV5,
          { path: [ARB_USDT_LEGACY, arbitrum.weth, arbitrum.link], fees: [3000, 3000], exchange: 3,
            pool: zeroAddress, poolIds: [], tickSpacing: [] },
        ],
      },
      // → WETH
      [arbitrum.weth]: {
        kind: 'aaveDeleveredRedeem',
        contract: 'FlashMintAaveDelevered',
        outputToken: arbitrum.weth,
        componentSwapData: [
          { path: [arbitrum.link, arbitrum.weth], fees: [3000], exchange: 3,
            pool: zeroAddress, poolIds: [], tickSpacing: [] },
          { path: [ARB_USDT_LEGACY, arbitrum.weth], fees: [3000], exchange: 3,
            pool: zeroAddress, poolIds: [], tickSpacing: [] },
        ],
      },
      // → USDC (LINK → WETH → USDC; USDT → USDC via 0.01% stable pool)
      [arbitrum.usdc]: {
        kind: 'aaveDeleveredRedeem',
        contract: 'FlashMintAaveDelevered',
        outputToken: arbitrum.usdc,
        componentSwapData: [
          { path: [arbitrum.link, arbitrum.weth, arbitrum.usdc], fees: [3000, 500], exchange: 3,
            pool: zeroAddress, poolIds: [], tickSpacing: [] },
          { path: [ARB_USDT_LEGACY, arbitrum.usdc], fees: [100], exchange: 3,
            pool: zeroAddress, poolIds: [], tickSpacing: [] },
        ],
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
