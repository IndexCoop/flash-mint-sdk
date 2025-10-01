export interface InputTokenMapEntry {
  whale: string
}

export type InputTokenMap = Record<number, Record<string, InputTokenMapEntry>>

const inputTokenMap: InputTokenMap = {
  8453: {
    USDC: { whale: '0x3304E22DDaa22bCdC5fCa2269b418046aE7b566A' },
    cbBTC: { whale: '0x9d719096fF38c8D6652Cd95233e58452f4F4a2f0' },
    WETH: { whale: '0x621e7c767004266c8109e83143ab0Da521B650d6' },
    ETH: { whale: '0x621e7c767004266c8109e83143ab0Da521B650d6' },
  },
  1: {
    USDC: { whale: '0x8EB8a3b98659Cce290402893d0123abb75E3ab28' },
    USDT: { whale: '0xF977814e90dA44bFA03b6295A0616a897441aceC' },
    WBTC: { whale: '0xE940ae8cF59fE2709BBc572CBAD2633fB45Abf46' },
    WETH: { whale: '0x8EB8a3b98659Cce290402893d0123abb75E3ab28' },
    ETH: { whale: '0x8EB8a3b98659Cce290402893d0123abb75E3ab28' },
    XAUt: { whale: '0x5754284f345afc66a98fbB0a0Afe71e0F007B949' },
  },
  42161: {
    USDC: { whale: '0xB38e8c17e38363aF6EbdCb3dAE12e0243582891D' },
    'USD₮0': { whale: '0xB38e8c17e38363aF6EbdCb3dAE12e0243582891D' },
    WBTC: { whale: '0x8Cc94Dc843e1eA7a19805E0Cca43001123512b6a' },
    WETH: { whale: '0xC3E5607Cd4ca0D5Fe51e09B60Ed97a0Ae6F874dd' },
    ETH: { whale: '0xC3E5607Cd4ca0D5Fe51e09B60Ed97a0Ae6F874dd' },
    ARB: { whale: '0xF3FC178157fb3c87548bAA86F9d24BA38E649B58' },
    AAVE: { whale: '0xBA12222222228d8Ba445958a75a0704d566BF2C8' },
    LINK: { whale: '0xBA12222222228d8Ba445958a75a0704d566BF2C8' },
  },
}

export default inputTokenMap
