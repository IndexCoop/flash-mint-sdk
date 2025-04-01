import FLASHMINT_LEVERAGED_ZEROEX_ABI from 'constants/abis/FlashMintLeveragedZeroEx.json'
import FLASHMINT_LEVERAGED_ZEROEX_BALANCER_FL_ABI from 'constants/abis/FlashMintLeveragedZeroExBalancerFL.json'
import { Contracts } from 'constants/contracts'
import { FlashMintAbis } from 'utils/abis'
import { arbitrum } from 'viem/chains'

describe('FlashMintAbis', () => {
  test('returns correct ABI for FlashMintLeveragedZeroEx on Base', async () => {
    expect(
      FlashMintAbis[Contracts[arbitrum.id].FlashMintLeveragedZeroEx],
    ).toEqual(FLASHMINT_LEVERAGED_ZEROEX_BALANCER_FL_ABI)
  })

  test('returns correct ABI for FlashMintLeveragedZeroEx on Base', async () => {
    expect(FlashMintAbis[Contracts[8453].FlashMintLeveragedZeroEx]).toEqual(
      FLASHMINT_LEVERAGED_ZEROEX_ABI,
    )
  })

  test('returns correct ABI for FlashMintLeveragedZeroEx on Mainnet', async () => {
    expect(FlashMintAbis[Contracts[1].FlashMintLeveragedZeroEx]).toEqual(
      FLASHMINT_LEVERAGED_ZEROEX_ABI,
    )
  })

  test('returns correct ABI for FlashMintLeveragedZeroEx (icETH) on Mainnet', async () => {
    expect(FlashMintAbis[Contracts[1].FlashMintLeveragedZeroEx_AaveV2]).toEqual(
      FLASHMINT_LEVERAGED_ZEROEX_ABI,
    )
  })
})
