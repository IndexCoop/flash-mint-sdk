export interface InputTokenMapEntry {
  whale: string
}

export type InputTokenMap = Record<number, Record<string, InputTokenMapEntry>>

const inputTokenMap: InputTokenMap = {
  8453: {
    // USDC: Aerodrome USDC/USDbC stable pool — large, sticky USDC holder.
    USDC: { whale: '0xcDAC0d6c6C59727a65F871236188350531885C43' },
    cbBTC: { whale: '0xE4caBCb27575E01343EbFa8dE82bFE5fc8908aEd' },
    // WETH/ETH: Morpho Blue is the deepest WETH holder on Base (>60k WETH).
    WETH: { whale: '0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb' },
    ETH: { whale: '0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb' },
  },
  1: {
    USDC: { whale: '0x37305B1cD40574E4C5Ce33f8e8306Be057fD7341' },
    USDT: { whale: '0xF977814e90dA44bFA03b6295A0616a897441aceC' },
    WBTC: { whale: '0x5Ee5bf7ae06D1Be5997A1A72006FE6C607eC6DE8' },
    WETH: { whale: '0x4d5F47FA6A74757f35C14fD3a6Ef8E3C9BC514E8' },
    ETH: { whale: '0x4d5F47FA6A74757f35C14fD3a6Ef8E3C9BC514E8' },
    XAUt: { whale: '0x5754284f345afc66a98fbB0a0Afe71e0F007B949' },
  },
  42161: {
    USDC: { whale: '0x2Df1c51E09aECF9cacB7bc98cB1742757f163dF7' },
    'USD₮0': { whale: '0x9E36CB86a159d479cEd94Fa05036f235Ac40E1d5' },
    WBTC: { whale: '0x078f358208685046a11C85e8ad32895DED33A249' },
    WETH: { whale: '0x70d95587d40A2caf56bd97485aB3Eec10Bee6336' },
    ETH: { whale: '0x70d95587d40A2caf56bd97485aB3Eec10Bee6336' },
    ARB: { whale: '0xF3FC178157fb3c87548bAA86F9d24BA38E649B58' },
    AAVE: { whale: '0xf329e36C7bF6E5E86ce2150875a84Ce77f477375' },
    LINK: { whale: '0x191c10Aa4AF7C30e871E70C95dB0E4eb77237530' },
  },
}

export default inputTokenMap
