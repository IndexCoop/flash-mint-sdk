import type { SwapData, SwapDataV5 } from 'utils'
import { zeroAddress } from 'viem'

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
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2': {
        contract: 'FlashMintLeveraged',
        swapDataDebtForCollateral: {
          path: [
            '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
            '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          ],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: ['0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'],
          fees: [],
          exchange: 0,
          pool: zeroAddress,
        },
      },
      '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48': {
        contract: 'FlashMintLeveraged',
        swapDataDebtForCollateral: {
          path: [
            '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
            '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          ],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [
            '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
            '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          ],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
      },
      '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599': {
        contract: 'FlashMintLeveraged',
        swapDataDebtForCollateral: {
          path: [
            '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
            '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          ],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [
            '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
            '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          ],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
      },
    },
    'BTC2X': {
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2': {
        contract: 'FlashMintLeveraged',
        swapDataDebtForCollateral: {
          path: [
            '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
            '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
          ],
          fees: [3000],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [
            '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
            '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
          ],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
      },
      '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48': {
        contract: 'FlashMintLeveraged',
        swapDataDebtForCollateral: {
          path: [
            '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
            '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
          ],
          fees: [3000],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [
            '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
            '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
          ],
          fees: [3000],
          exchange: 3,
          pool: zeroAddress,
        },
      },
      '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599': {
        contract: 'FlashMintLeveraged',
        swapDataDebtForCollateral: {
          path: [
            '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
            '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
          ],
          fees: [3000],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: ['0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599'],
          fees: [],
          exchange: 3,
          pool: zeroAddress,
        },
      },
    },
  },
  8453: {
    'ETH2X': {
      '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913': {
        contract: 'FlashMintLeveragedExtended',
        swapDataDebtForCollateral: {
          path: [
            '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
            '0x4200000000000000000000000000000000000006',
          ],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [
            '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
            '0x4200000000000000000000000000000000000006',
          ],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
      },
      '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf': {
        contract: 'FlashMintLeveragedExtended',
        swapDataDebtForCollateral: {
          path: [
            '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
            '0x4200000000000000000000000000000000000006',
          ],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [
            '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf',
            '0x4200000000000000000000000000000000000006',
          ],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
      },
      '0x4200000000000000000000000000000000000006': {
        contract: 'FlashMintLeveragedExtended',
        swapDataDebtForCollateral: {
          path: [
            '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
            '0x4200000000000000000000000000000000000006',
          ],
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
      '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913': {
        contract: 'FlashMintLeveragedExtended',
        swapDataDebtForCollateral: {
          path: [
            '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
            '0x4200000000000000000000000000000000000006',
          ],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [
            '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
            '0x4200000000000000000000000000000000000006',
          ],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
      },
      '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf': {
        contract: 'FlashMintLeveragedExtended',
        swapDataDebtForCollateral: {
          path: [
            '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
            '0x4200000000000000000000000000000000000006',
          ],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [
            '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf',
            '0x4200000000000000000000000000000000000006',
          ],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
      },
      '0x4200000000000000000000000000000000000006': {
        contract: 'FlashMintLeveragedExtended',
        swapDataDebtForCollateral: {
          path: [
            '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
            '0x4200000000000000000000000000000000000006',
          ],
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
      '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913': {
        contract: 'FlashMintLeveragedMorphoAaveLM',
        swapDataDebtForCollateral: {
          path: [
            '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
            '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf',
          ],
          fees: [],
          exchange: 7,
          poolIds: [],
          pool: zeroAddress,
          tickSpacing: [100],
        },
        swapDataInputToken: {
          path: [
            '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
            '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf',
          ],
          fees: [],
          exchange: 7,
          poolIds: [],
          pool: zeroAddress,
          tickSpacing: [100],
        },
      },
      '0x4200000000000000000000000000000000000006': {
        contract: 'FlashMintLeveragedMorphoAaveLM',
        swapDataDebtForCollateral: {
          path: [
            '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
            '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf',
          ],
          fees: [],
          exchange: 7,
          poolIds: [],
          pool: zeroAddress,
          tickSpacing: [100],
        },
        swapDataInputToken: {
          path: [
            '0x4200000000000000000000000000000000000006',
            '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf',
          ],
          fees: [],
          exchange: 7,
          poolIds: [],
          pool: zeroAddress,
          tickSpacing: [100],
        },
      },
      '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf': {
        contract: 'FlashMintLeveragedMorphoAaveLM',
        swapDataDebtForCollateral: {
          path: [
            '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
            '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf',
          ],
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
      '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913': {
        contract: 'FlashMintLeveragedMorphoAaveLM',
        swapDataDebtForCollateral: {
          path: [
            '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
            '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf',
          ],
          fees: [],
          exchange: 7,
          poolIds: [],
          pool: zeroAddress,
          tickSpacing: [100],
        },
        swapDataInputToken: {
          path: [
            '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
            '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf',
          ],
          fees: [],
          exchange: 7,
          poolIds: [],
          pool: zeroAddress,
          tickSpacing: [100],
        },
      },
      '0x4200000000000000000000000000000000000006': {
        contract: 'FlashMintLeveragedMorphoAaveLM',
        swapDataDebtForCollateral: {
          path: [
            '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
            '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf',
          ],
          fees: [],
          exchange: 7,
          poolIds: [],
          pool: zeroAddress,
          tickSpacing: [100],
        },
        swapDataInputToken: {
          path: [
            '0x4200000000000000000000000000000000000006',
            '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf',
          ],
          fees: [],
          exchange: 7,
          poolIds: [],
          pool: zeroAddress,
          tickSpacing: [100],
        },
      },
      '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf': {
        contract: 'FlashMintLeveragedMorphoAaveLM',
        swapDataDebtForCollateral: {
          path: [
            '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
            '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf',
          ],
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
      '0x4200000000000000000000000000000000000006': {
        contract: 'FlashMintLeveragedMorphoV2',
        swapDataDebtForCollateral: {
          path: [
            '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
            '0x4200000000000000000000000000000000000006',
            '0x9B8Df6E244526ab5F6e6400d331DB28C8fdDdb55',
          ],
          fees: [],
          exchange: 7,
          poolIds: [],
          pool: zeroAddress,
          tickSpacing: [100, 200],
        },
        swapDataInputToken: {
          path: [
            '0x4200000000000000000000000000000000000006',
            '0x9B8Df6E244526ab5F6e6400d331DB28C8fdDdb55',
          ],
          fees: [],
          exchange: 7,
          poolIds: [],
          pool: zeroAddress,
          tickSpacing: [200],
        },
      },
      '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913': {
        contract: 'FlashMintLeveragedMorphoV2',
        swapDataDebtForCollateral: {
          path: [
            '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
            '0x4200000000000000000000000000000000000006',
            '0x9B8Df6E244526ab5F6e6400d331DB28C8fdDdb55',
          ],
          fees: [],
          exchange: 7,
          poolIds: [],
          pool: zeroAddress,
          tickSpacing: [100, 200],
        },
        swapDataInputToken: {
          path: [
            '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
            '0x4200000000000000000000000000000000000006',
            '0x9B8Df6E244526ab5F6e6400d331DB28C8fdDdb55',
          ],
          fees: [],
          exchange: 7,
          poolIds: [],
          pool: zeroAddress,
          tickSpacing: [100, 200],
        },
      },
      '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf': {
        contract: 'FlashMintLeveragedMorphoV2',
        swapDataDebtForCollateral: {
          path: [
            '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
            '0x4200000000000000000000000000000000000006',
            '0x9B8Df6E244526ab5F6e6400d331DB28C8fdDdb55',
          ],
          fees: [],
          exchange: 7,
          poolIds: [],
          pool: zeroAddress,
          tickSpacing: [100, 200],
        },
        swapDataInputToken: {
          path: [
            '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf',
            '0x4200000000000000000000000000000000000006',
            '0x9B8Df6E244526ab5F6e6400d331DB28C8fdDdb55',
          ],
          fees: [],
          exchange: 7,
          poolIds: [],
          pool: zeroAddress,
          tickSpacing: [100, 200],
        },
      },
    },
    'uSOL3x': {
      '0x4200000000000000000000000000000000000006': {
        contract: 'FlashMintLeveragedMorphoV2',
        swapDataDebtForCollateral: {
          path: [
            '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
            '0x4200000000000000000000000000000000000006',
            '0x9B8Df6E244526ab5F6e6400d331DB28C8fdDdb55',
          ],
          fees: [],
          exchange: 7,
          pool: zeroAddress,
          poolIds: [],
          tickSpacing: [100, 200],
        },
        swapDataInputToken: {
          path: [
            '0x4200000000000000000000000000000000000006',
            '0x9B8Df6E244526ab5F6e6400d331DB28C8fdDdb55',
          ],
          fees: [],
          exchange: 7,
          pool: zeroAddress,
          poolIds: [],
          tickSpacing: [200],
        },
      },
      '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913': {
        contract: 'FlashMintLeveragedMorphoV2',
        swapDataDebtForCollateral: {
          path: [
            '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
            '0x4200000000000000000000000000000000000006',
            '0x9B8Df6E244526ab5F6e6400d331DB28C8fdDdb55',
          ],
          fees: [],
          exchange: 7,
          pool: zeroAddress,
          poolIds: [],
          tickSpacing: [100, 200],
        },
        swapDataInputToken: {
          path: [
            '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
            '0x4200000000000000000000000000000000000006',
            '0x9B8Df6E244526ab5F6e6400d331DB28C8fdDdb55',
          ],
          fees: [],
          exchange: 7,
          pool: zeroAddress,
          poolIds: [],
          tickSpacing: [100, 200],
        },
      },
      '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf': {
        contract: 'FlashMintLeveragedMorphoV2',
        swapDataDebtForCollateral: {
          path: [
            '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
            '0x4200000000000000000000000000000000000006',
            '0x9B8Df6E244526ab5F6e6400d331DB28C8fdDdb55',
          ],
          fees: [],
          exchange: 7,
          poolIds: [],
          pool: zeroAddress,
          tickSpacing: [100, 200],
        },
        swapDataInputToken: {
          path: [
            '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf',
            '0x4200000000000000000000000000000000000006',
            '0x9B8Df6E244526ab5F6e6400d331DB28C8fdDdb55',
          ],
          fees: [],
          exchange: 7,
          poolIds: [],
          pool: zeroAddress,
          tickSpacing: [100, 200],
        },
      },
    },
    'uSUI2x': {
      '0x4200000000000000000000000000000000000006': {
        contract: 'FlashMintLeveragedMorphoV2',
        swapDataDebtForCollateral: {
          path: [
            '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
            '0x4200000000000000000000000000000000000006',
            '0xb0505e5a99abd03d94a1169e638B78EDfEd26ea4',
          ],
          fees: [],
          exchange: 7,
          tickSpacing: [100, 200],
          poolIds: [],
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [
            '0x4200000000000000000000000000000000000006',
            '0xb0505e5a99abd03d94a1169e638B78EDfEd26ea4',
          ],
          fees: [],
          exchange: 7,
          tickSpacing: [200],
          poolIds: [],
          pool: zeroAddress,
        },
      },
      '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913': {
        contract: 'FlashMintLeveragedMorphoV2',
        swapDataDebtForCollateral: {
          path: [
            '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
            '0x4200000000000000000000000000000000000006',
            '0xb0505e5a99abd03d94a1169e638B78EDfEd26ea4',
          ],
          fees: [],
          exchange: 7,
          tickSpacing: [100, 200],
          poolIds: [],
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [
            '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
            '0x4200000000000000000000000000000000000006',
            '0xb0505e5a99abd03d94a1169e638B78EDfEd26ea4',
          ],
          fees: [],
          exchange: 7,
          tickSpacing: [100, 200],
          poolIds: [],
          pool: zeroAddress,
        },
      },
      '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf': {
        contract: 'FlashMintLeveragedMorphoV2',
        swapDataDebtForCollateral: {
          path: [
            '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
            '0x4200000000000000000000000000000000000006',
            '0xb0505e5a99abd03d94a1169e638B78EDfEd26ea4',
          ],
          fees: [],
          exchange: 7,
          poolIds: [],
          pool: zeroAddress,
          tickSpacing: [100, 200],
        },
        swapDataInputToken: {
          path: [
            '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf',
            '0x4200000000000000000000000000000000000006',
            '0xb0505e5a99abd03d94a1169e638B78EDfEd26ea4',
          ],
          fees: [],
          exchange: 7,
          poolIds: [],
          pool: zeroAddress,
          tickSpacing: [100, 200],
        },
      },
    },
    'uSUI3x': {
      '0x4200000000000000000000000000000000000006': {
        contract: 'FlashMintLeveragedMorphoV2',
        swapDataDebtForCollateral: {
          path: [
            '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
            '0x4200000000000000000000000000000000000006',
            '0xb0505e5a99abd03d94a1169e638B78EDfEd26ea4',
          ],
          fees: [],
          exchange: 7,
          tickSpacing: [100, 200],
          poolIds: [],
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [
            '0x4200000000000000000000000000000000000006',
            '0xb0505e5a99abd03d94a1169e638B78EDfEd26ea4',
          ],
          fees: [],
          exchange: 7,
          tickSpacing: [200],
          poolIds: [],
          pool: zeroAddress,
        },
      },
      '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913': {
        contract: 'FlashMintLeveragedMorphoV2',
        swapDataDebtForCollateral: {
          path: [
            '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
            '0x4200000000000000000000000000000000000006',
            '0xb0505e5a99abd03d94a1169e638B78EDfEd26ea4',
          ],
          fees: [],
          exchange: 7,
          tickSpacing: [100, 200],
          poolIds: [],
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [
            '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
            '0x4200000000000000000000000000000000000006',
            '0xb0505e5a99abd03d94a1169e638B78EDfEd26ea4',
          ],
          fees: [],
          exchange: 7,
          tickSpacing: [100, 200],
          poolIds: [],
          pool: zeroAddress,
        },
      },
      '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf': {
        contract: 'FlashMintLeveragedMorphoV2',
        swapDataDebtForCollateral: {
          path: [
            '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
            '0x4200000000000000000000000000000000000006',
            '0xb0505e5a99abd03d94a1169e638B78EDfEd26ea4',
          ],
          fees: [],
          exchange: 7,
          poolIds: [],
          pool: zeroAddress,
          tickSpacing: [100, 200],
        },
        swapDataInputToken: {
          path: [
            '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf',
            '0x4200000000000000000000000000000000000006',
            '0xb0505e5a99abd03d94a1169e638B78EDfEd26ea4',
          ],
          fees: [],
          exchange: 7,
          poolIds: [],
          pool: zeroAddress,
          tickSpacing: [100, 200],
        },
      },
    },
    'wstETH15x': {
      '0x4200000000000000000000000000000000000006': {
        contract: 'FlashMintLeveragedMorphoV2',
        swapDataDebtForCollateral: {
          path: [
            '0x4200000000000000000000000000000000000006',
            '0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452',
          ],
          fees: [],
          exchange: 7,
          tickSpacing: [1],
          poolIds: [],
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [
            '0x4200000000000000000000000000000000000006',
            '0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452',
          ],
          fees: [],
          exchange: 7,
          tickSpacing: [1],
          poolIds: [],
          pool: zeroAddress,
        },
      },
      '0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452': {
        contract: 'FlashMintLeveragedMorphoV2',
        swapDataDebtForCollateral: {
          path: [
            '0x4200000000000000000000000000000000000006',
            '0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452',
          ],
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
      '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913': {
        contract: 'FlashMintLeveragedMorphoV2',
        swapDataDebtForCollateral: {
          path: [
            '0x4200000000000000000000000000000000000006',
            '0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452',
          ],
          fees: [],
          exchange: 7,
          tickSpacing: [1],
          poolIds: [],
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [
            '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
            '0x4200000000000000000000000000000000000006',
            '0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452',
          ],
          fees: [],
          exchange: 7,
          tickSpacing: [100, 1],
          poolIds: [],
          pool: zeroAddress,
        },
      },
    },
  },
  42161: {
    'BTC2X': {
      '0xaf88d065e77c8cC2239327C5EDb3A432268e5831': {
        contract: 'FlashMintLeveragedExtended',
        swapDataDebtForCollateral: {
          path: [
            '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
            '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
            '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f',
          ],
          fees: [500, 500],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [
            '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
            '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
            '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f',
          ],
          fees: [500, 500],
          exchange: 3,
          pool: zeroAddress,
        },
      },
      '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1': {
        contract: 'FlashMintLeveragedExtended',
        swapDataDebtForCollateral: {
          path: [
            '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
            '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
            '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f',
          ],
          fees: [500, 500],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [
            '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
            '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f',
          ],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
      },
    },
    'BTC3X': {
      '0xaf88d065e77c8cC2239327C5EDb3A432268e5831': {
        contract: 'FlashMintLeveragedExtended',
        swapDataDebtForCollateral: {
          path: [
            '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
            '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
            '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f',
          ],
          fees: [500, 500],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [
            '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
            '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
            '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f',
          ],
          fees: [500, 500],
          exchange: 3,
          pool: zeroAddress,
        },
      },
      '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1': {
        contract: 'FlashMintLeveragedExtended',
        swapDataDebtForCollateral: {
          path: [
            '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
            '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
            '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f',
          ],
          fees: [500, 500],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [
            '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
            '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f',
          ],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
      },
    },
    'ETH3X': {
      '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1': {
        contract: 'FlashMintLeveragedExtended',
        swapDataDebtForCollateral: {
          path: [
            '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
            '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
          ],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: ['0x82aF49447D8a07e3bd95BD0d56f35241523fBab1'],
          fees: [],
          exchange: 3,
          pool: zeroAddress,
        },
      },
      '0xaf88d065e77c8cC2239327C5EDb3A432268e5831': {
        contract: 'FlashMintLeveragedExtended',
        swapDataDebtForCollateral: {
          path: [
            '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
            '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
          ],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [
            '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
            '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
          ],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
      },
    },
    'ETH2X': {
      '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1': {
        contract: 'FlashMintLeveragedExtended',
        swapDataDebtForCollateral: {
          path: [
            '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
            '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
          ],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: ['0x82aF49447D8a07e3bd95BD0d56f35241523fBab1'],
          fees: [],
          exchange: 3,
          pool: zeroAddress,
        },
      },
      '0xaf88d065e77c8cC2239327C5EDb3A432268e5831': {
        contract: 'FlashMintLeveragedExtended',
        swapDataDebtForCollateral: {
          path: [
            '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
            '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
          ],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [
            '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
            '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
          ],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
      },
    },
    'BTC2xETH': {
      '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1': {
        contract: 'FlashMintLeveragedExtended',
        swapDataDebtForCollateral: {
          path: [
            '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
            '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f',
          ],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [
            '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
            '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f',
          ],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
      },
      '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f': {
        contract: 'FlashMintLeveragedExtended',
        swapDataDebtForCollateral: {
          path: [
            '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
            '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f',
          ],
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
      '0xaf88d065e77c8cC2239327C5EDb3A432268e5831': {
        contract: 'FlashMintLeveragedExtended',
        swapDataDebtForCollateral: {
          path: [
            '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
            '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f',
          ],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [
            '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
            '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
            '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f',
          ],
          fees: [100, 500],
          exchange: 3,
          pool: zeroAddress,
        },
      },
    },
    'ETH2xBTC': {
      '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1': {
        contract: 'FlashMintLeveragedExtended',
        swapDataDebtForCollateral: {
          path: [
            '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f',
            '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
          ],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: ['0x82aF49447D8a07e3bd95BD0d56f35241523fBab1'],
          fees: [],
          exchange: 0,
          pool: zeroAddress,
        },
      },
      '0xaf88d065e77c8cC2239327C5EDb3A432268e5831': {
        contract: 'FlashMintLeveragedExtended',
        swapDataDebtForCollateral: {
          path: [
            '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f',
            '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
          ],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [
            '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
            '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
          ],
          fees: [500],
          exchange: 0,
          pool: zeroAddress,
        },
      },
    },
    'iBTC1X': {
      '0xaf88d065e77c8cC2239327C5EDb3A432268e5831': {
        contract: 'FlashMintLeveragedExtended',
        swapDataDebtForCollateral: {
          path: [
            '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f',
            '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
          ],
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
      '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1': {
        contract: 'FlashMintLeveragedExtended',
        swapDataDebtForCollateral: {
          path: [
            '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f',
            '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
          ],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [
            '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
            '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
          ],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
      },
    },
    'iETH1X': {
      '0xaf88d065e77c8cC2239327C5EDb3A432268e5831': {
        contract: 'FlashMintLeveragedExtended',
        swapDataDebtForCollateral: {
          path: [
            '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
            '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
          ],
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
      '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1': {
        contract: 'FlashMintLeveragedExtended',
        swapDataDebtForCollateral: {
          path: [
            '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
            '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
          ],
          fees: [500],
          exchange: 3,
          pool: zeroAddress,
        },
        swapDataInputToken: {
          path: [
            '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
            '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
          ],
          fees: [3000],
          exchange: 3,
          pool: zeroAddress,
        },
      },
    },
  },
} as const
