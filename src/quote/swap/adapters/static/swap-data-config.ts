import { getTokenByChainAndSymbol } from '@indexcoop/tokenlists'
import type { SwapData, SwapDataV5 } from 'utils'
import { zeroAddress } from 'viem'

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

export const SwapDataConfig: Readonly<{
  [chainId: number]: Readonly<{
    [indexTokenSymbol: string]: Readonly<{
      [inputToken: string]: Readonly<{
        contract: string
        swapDataDebtForCollateral: SwapData | SwapDataV5
        swapDataInputToken: SwapData | SwapDataV5
      }>
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
          fees: [3000],
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
          fees: [3000],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [mainnet.usdt, mainnet.xaut],
          fees: [3000],
          exchange: 3,
          pool: zeroAddress,
        },
      },
      [mainnet.usdc]: {
        contract: 'FlashMintLeveragedAaveFL',
        swapDataDebtForCollateral: {
          path: [mainnet.usdt, mainnet.xaut],
          fees: [3000],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [mainnet.usdc, mainnet.usdt, mainnet.xaut],
          fees: [100, 3000],
          exchange: 3,
          pool: zeroAddress,
        },
      },
      [mainnet.wbtc]: {
        contract: 'FlashMintLeveragedAaveFL',
        swapDataDebtForCollateral: {
          path: [mainnet.usdt, mainnet.xaut],
          fees: [3000],
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
          fees: [3000],
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
        contract: 'FlashMintLeveragedExtended',
        swapDataDebtForCollateral: {
          path: [base.usdc, base.weth],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [base.usdc, base.weth],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
      },
      [base.cbbtc]: {
        contract: 'FlashMintLeveragedExtended',
        swapDataDebtForCollateral: {
          path: [base.usdc, base.weth],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [base.cbbtc, base.weth],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
      },
      [base.weth]: {
        contract: 'FlashMintLeveragedExtended',
        swapDataDebtForCollateral: {
          path: [base.usdc, base.weth],
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
    },
    'ETH3X': {
      [base.usdc]: {
        contract: 'FlashMintLeveragedExtended',
        swapDataDebtForCollateral: {
          path: [base.usdc, base.weth],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [base.usdc, base.weth],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
      },
      [base.cbbtc]: {
        contract: 'FlashMintLeveragedExtended',
        swapDataDebtForCollateral: {
          path: [base.usdc, base.weth],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [base.cbbtc, base.weth],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
      },
      [base.weth]: {
        contract: 'FlashMintLeveragedExtended',
        swapDataDebtForCollateral: {
          path: [base.usdc, base.weth],
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
    'uSOL2x': {
      [base.weth]: {
        contract: 'FlashMintLeveragedMorphoV2',
        swapDataDebtForCollateral: {
          path: [base.usdc, base.weth, base.usol],
          fees: [],
          exchange: 7,
          poolIds: [],
          pool: zeroAddress,
          tickSpacing: [100, 200],
        },
        swapDataInputToken: {
          path: [base.weth, base.usol],
          fees: [],
          exchange: 7,
          poolIds: [],
          pool: zeroAddress,
          tickSpacing: [200],
        },
      },
      [base.usdc]: {
        contract: 'FlashMintLeveragedMorphoV2',
        swapDataDebtForCollateral: {
          path: [base.usdc, base.weth, base.usol],
          fees: [],
          exchange: 7,
          poolIds: [],
          pool: zeroAddress,
          tickSpacing: [100, 200],
        },
        swapDataInputToken: {
          path: [base.usdc, base.weth, base.usol],
          fees: [],
          exchange: 7,
          poolIds: [],
          pool: zeroAddress,
          tickSpacing: [100, 200],
        },
      },
      [base.cbbtc]: {
        contract: 'FlashMintLeveragedMorphoV2',
        swapDataDebtForCollateral: {
          path: [base.usdc, base.weth, base.usol],
          fees: [],
          exchange: 7,
          poolIds: [],
          pool: zeroAddress,
          tickSpacing: [100, 200],
        },
        swapDataInputToken: {
          path: [base.cbbtc, base.weth, base.usol],
          fees: [],
          exchange: 7,
          poolIds: [],
          pool: zeroAddress,
          tickSpacing: [100, 200],
        },
      },
    },
    'uSOL3x': {
      [base.weth]: {
        contract: 'FlashMintLeveragedMorphoV2',
        swapDataDebtForCollateral: {
          path: [base.usdc, base.weth, base.usol],
          fees: [],
          exchange: 7,
          pool: zeroAddress,
          poolIds: [],
          tickSpacing: [100, 200],
        },
        swapDataInputToken: {
          path: [base.weth, base.usol],
          fees: [],
          exchange: 7,
          pool: zeroAddress,
          poolIds: [],
          tickSpacing: [200],
        },
      },
      [base.usdc]: {
        contract: 'FlashMintLeveragedMorphoV2',
        swapDataDebtForCollateral: {
          path: [base.usdc, base.weth, base.usol],
          fees: [],
          exchange: 7,
          pool: zeroAddress,
          poolIds: [],
          tickSpacing: [100, 200],
        },
        swapDataInputToken: {
          path: [base.usdc, base.weth, base.usol],
          fees: [],
          exchange: 7,
          pool: zeroAddress,
          poolIds: [],
          tickSpacing: [100, 200],
        },
      },
      [base.cbbtc]: {
        contract: 'FlashMintLeveragedMorphoV2',
        swapDataDebtForCollateral: {
          path: [base.usdc, base.weth, base.usol],
          fees: [],
          exchange: 7,
          poolIds: [],
          pool: zeroAddress,
          tickSpacing: [100, 200],
        },
        swapDataInputToken: {
          path: [base.cbbtc, base.weth, base.usol],
          fees: [],
          exchange: 7,
          poolIds: [],
          pool: zeroAddress,
          tickSpacing: [100, 200],
        },
      },
    },
    'uSUI2x': {
      [base.weth]: {
        contract: 'FlashMintLeveragedMorphoV2',
        swapDataDebtForCollateral: {
          path: [base.usdc, base.weth, base.usui],
          fees: [],
          exchange: 7,
          tickSpacing: [100, 200],
          poolIds: [],
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [base.weth, base.usui],
          fees: [],
          exchange: 7,
          tickSpacing: [200],
          poolIds: [],
          pool: zeroAddress,
        },
      },
      [base.usdc]: {
        contract: 'FlashMintLeveragedMorphoV2',
        swapDataDebtForCollateral: {
          path: [base.usdc, base.weth, base.usui],
          fees: [],
          exchange: 7,
          tickSpacing: [100, 200],
          poolIds: [],
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [base.usdc, base.weth, base.usui],
          fees: [],
          exchange: 7,
          tickSpacing: [100, 200],
          poolIds: [],
          pool: zeroAddress,
        },
      },
      [base.cbbtc]: {
        contract: 'FlashMintLeveragedMorphoV2',
        swapDataDebtForCollateral: {
          path: [base.usdc, base.weth, base.usui],
          fees: [],
          exchange: 7,
          poolIds: [],
          pool: zeroAddress,
          tickSpacing: [100, 200],
        },
        swapDataInputToken: {
          path: [base.cbbtc, base.weth, base.usui],
          fees: [],
          exchange: 7,
          poolIds: [],
          pool: zeroAddress,
          tickSpacing: [100, 200],
        },
      },
    },
    'uSUI3x': {
      [base.weth]: {
        contract: 'FlashMintLeveragedMorphoV2',
        swapDataDebtForCollateral: {
          path: [base.usdc, base.weth, base.usui],
          fees: [],
          exchange: 7,
          tickSpacing: [100, 200],
          poolIds: [],
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [base.weth, base.usui],
          fees: [],
          exchange: 7,
          tickSpacing: [200],
          poolIds: [],
          pool: zeroAddress,
        },
      },
      [base.usdc]: {
        contract: 'FlashMintLeveragedMorphoV2',
        swapDataDebtForCollateral: {
          path: [base.usdc, base.weth, base.usui],
          fees: [],
          exchange: 7,
          tickSpacing: [100, 200],
          poolIds: [],
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [base.usdc, base.weth, base.usui],
          fees: [],
          exchange: 7,
          tickSpacing: [100, 200],
          poolIds: [],
          pool: zeroAddress,
        },
      },
      [base.cbbtc]: {
        contract: 'FlashMintLeveragedMorphoV2',
        swapDataDebtForCollateral: {
          path: [base.usdc, base.weth, base.usui],
          fees: [],
          exchange: 7,
          poolIds: [],
          pool: zeroAddress,
          tickSpacing: [100, 200],
        },
        swapDataInputToken: {
          path: [base.cbbtc, base.weth, base.usui],
          fees: [],
          exchange: 7,
          poolIds: [],
          pool: zeroAddress,
          tickSpacing: [100, 200],
        },
      },
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
      [base.weth]: {
        contract: 'FlashMintLeveragedMorphoV2',
        swapDataDebtForCollateral: {
          path: [base.usdc, base.weth, base.uxrp],
          fees: [],
          exchange: 7,
          tickSpacing: [100, 200],
          poolIds: [],
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [base.weth, base.uxrp],
          fees: [],
          exchange: 7,
          tickSpacing: [200],
          poolIds: [],
          pool: zeroAddress,
        },
      },
      [base.usdc]: {
        contract: 'FlashMintLeveragedMorphoV2',
        swapDataDebtForCollateral: {
          path: [base.usdc, base.weth, base.uxrp],
          fees: [],
          exchange: 7,
          tickSpacing: [100, 200],
          poolIds: [],
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [base.usdc, base.weth, base.uxrp],
          fees: [],
          exchange: 7,
          tickSpacing: [100, 200],
          poolIds: [],
          pool: zeroAddress,
        },
      },
      [base.cbbtc]: {
        contract: 'FlashMintLeveragedMorphoV2',
        swapDataDebtForCollateral: {
          path: [base.usdc, base.weth, base.uxrp],
          fees: [],
          exchange: 7,
          poolIds: [],
          pool: zeroAddress,
          tickSpacing: [100, 200],
        },
        swapDataInputToken: {
          path: [base.cbbtc, base.weth, base.uxrp],
          fees: [],
          exchange: 7,
          poolIds: [],
          pool: zeroAddress,
          tickSpacing: [100, 200],
        },
      },
    },
    'uXRP3x': {
      [base.weth]: {
        contract: 'FlashMintLeveragedMorphoV2',
        swapDataDebtForCollateral: {
          path: [base.usdc, base.weth, base.uxrp],
          fees: [],
          exchange: 7,
          tickSpacing: [100, 200],
          poolIds: [],
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [base.weth, base.uxrp],
          fees: [],
          exchange: 7,
          tickSpacing: [200],
          poolIds: [],
          pool: zeroAddress,
        },
      },
      [base.usdc]: {
        contract: 'FlashMintLeveragedMorphoV2',
        swapDataDebtForCollateral: {
          path: [base.usdc, base.weth, base.uxrp],
          fees: [],
          exchange: 7,
          tickSpacing: [100, 200],
          poolIds: [],
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [base.usdc, base.weth, base.uxrp],
          fees: [],
          exchange: 7,
          tickSpacing: [100, 200],
          poolIds: [],
          pool: zeroAddress,
        },
      },
      [base.cbbtc]: {
        contract: 'FlashMintLeveragedMorphoV2',
        swapDataDebtForCollateral: {
          path: [base.usdc, base.weth, base.uxrp],
          fees: [],
          exchange: 7,
          poolIds: [],
          pool: zeroAddress,
          tickSpacing: [100, 200],
        },
        swapDataInputToken: {
          path: [base.cbbtc, base.weth, base.uxrp],
          fees: [],
          exchange: 7,
          poolIds: [],
          pool: zeroAddress,
          tickSpacing: [100, 200],
        },
      },
    },
    'iETH1x': {
      [base.usdc]: {
        contract: 'FlashMintLeveragedExtended',
        swapDataDebtForCollateral: {
          path: [base.weth, base.usdc],
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
      [base.weth]: {
        contract: 'FlashMintLeveragedExtended',
        swapDataDebtForCollateral: {
          path: [base.weth, base.usdc],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [base.weth, base.usdc],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
      },
      [base.cbbtc]: {
        contract: 'FlashMintLeveragedExtended',
        swapDataDebtForCollateral: {
          path: [base.weth, base.usdc],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [base.cbbtc, base.usdc],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
      },
    },
    'iETH2x': {
      [base.usdc]: {
        contract: 'FlashMintLeveragedExtended',
        swapDataDebtForCollateral: {
          path: [base.weth, base.usdc],
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
      [base.weth]: {
        contract: 'FlashMintLeveragedExtended',
        swapDataDebtForCollateral: {
          path: [base.weth, base.usdc],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [base.weth, base.usdc],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
      },
      [base.cbbtc]: {
        contract: 'FlashMintLeveragedExtended',
        swapDataDebtForCollateral: {
          path: [base.weth, base.usdc],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [base.cbbtc, base.usdc],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
      },
    },
    'iBTC1x': {
      [base.usdc]: {
        contract: 'FlashMintLeveragedExtended',
        swapDataDebtForCollateral: {
          path: [base.cbbtc, base.usdc],
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
      [base.weth]: {
        contract: 'FlashMintLeveragedExtended',
        swapDataDebtForCollateral: {
          path: [base.cbbtc, base.usdc],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [base.weth, base.usdc],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
      },
      [base.cbbtc]: {
        contract: 'FlashMintLeveragedExtended',
        swapDataDebtForCollateral: {
          path: [base.cbbtc, base.usdc],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [base.cbbtc, base.usdc],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
      },
    },
    'iBTC2x': {
      [base.usdc]: {
        contract: 'FlashMintLeveragedExtended',
        swapDataDebtForCollateral: {
          path: [base.cbbtc, base.usdc],
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
      [base.weth]: {
        contract: 'FlashMintLeveragedExtended',
        swapDataDebtForCollateral: {
          path: [base.cbbtc, base.usdc],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [base.weth, base.usdc],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
      },
      [base.cbbtc]: {
        contract: 'FlashMintLeveragedExtended',
        swapDataDebtForCollateral: {
          path: [base.cbbtc, base.usdc],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [base.cbbtc, base.usdc],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
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
    'AAVE2x': {
      [arbitrum.usdc]: {
        contract: 'FlashMintLeveragedAaveFL',
        swapDataDebtForCollateral: {
          path: [arbitrum.usdt0, arbitrum.weth, arbitrum.aave],
          fees: [500, 3000],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [arbitrum.usdc, arbitrum.usdt0, arbitrum.weth, arbitrum.aave],
          fees: [100, 500, 3000],
          exchange: 3,
          pool: zeroAddress,
        },
      },
      [arbitrum.usdt0]: {
        contract: 'FlashMintLeveragedAaveFL',
        swapDataDebtForCollateral: {
          path: [arbitrum.usdt0, arbitrum.weth, arbitrum.aave],
          fees: [500, 3000],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [arbitrum.usdt0, arbitrum.weth, arbitrum.aave],
          fees: [500, 3000],
          exchange: 3,
          pool: zeroAddress,
        },
      },
      [arbitrum.weth]: {
        contract: 'FlashMintLeveragedAaveFL',
        swapDataDebtForCollateral: {
          path: [arbitrum.usdt0, arbitrum.weth, arbitrum.aave],
          fees: [500, 3000],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [arbitrum.weth, arbitrum.aave],
          fees: [3000],
          exchange: 3,
          pool: zeroAddress,
        },
      },
      [arbitrum.wbtc]: {
        contract: 'FlashMintLeveragedAaveFL',
        swapDataDebtForCollateral: {
          path: [arbitrum.usdt0, arbitrum.weth, arbitrum.aave],
          fees: [500, 3000],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [arbitrum.wbtc, arbitrum.usdt0, arbitrum.weth, arbitrum.aave],
          fees: [500, 500, 3000],
          exchange: 3,
          pool: zeroAddress,
        },
      },
      [arbitrum.aave]: {
        contract: 'FlashMintLeveragedAaveFL',
        swapDataDebtForCollateral: {
          path: [arbitrum.usdt0, arbitrum.weth, arbitrum.aave],
          fees: [500, 3000],
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
    },
    'LINK2x': {
      [arbitrum.usdc]: {
        contract: 'FlashMintLeveragedAaveFL',
        swapDataDebtForCollateral: {
          path: [arbitrum.usdt0, arbitrum.link],
          fees: [3000],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [arbitrum.usdc, arbitrum.usdt0, arbitrum.link],
          fees: [100, 3000],
          exchange: 3,
          pool: zeroAddress,
        },
      },
      [arbitrum.usdt0]: {
        contract: 'FlashMintLeveragedAaveFL',
        swapDataDebtForCollateral: {
          path: [arbitrum.usdt0, arbitrum.link],
          fees: [3000],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [arbitrum.usdt0, arbitrum.link],
          fees: [3000],
          exchange: 3,
          pool: zeroAddress,
        },
      },
      [arbitrum.weth]: {
        contract: 'FlashMintLeveragedAaveFL',
        swapDataDebtForCollateral: {
          path: [arbitrum.usdt0, arbitrum.link],
          fees: [3000],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [arbitrum.weth, arbitrum.usdt0, arbitrum.link],
          fees: [500, 3000],
          exchange: 3,
          pool: zeroAddress,
        },
      },
      [arbitrum.wbtc]: {
        contract: 'FlashMintLeveragedAaveFL',
        swapDataDebtForCollateral: {
          path: [arbitrum.usdt0, arbitrum.link],
          fees: [3000],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [arbitrum.wbtc, arbitrum.usdt0, arbitrum.link],
          fees: [500, 3000],
          exchange: 3,
          pool: zeroAddress,
        },
      },
      [arbitrum.link]: {
        contract: 'FlashMintLeveragedAaveFL',
        swapDataDebtForCollateral: {
          path: [arbitrum.usdt0, arbitrum.link],
          fees: [3000],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [arbitrum.link],
          fees: [],
          exchange: 3,
          pool: zeroAddress,
        },
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
