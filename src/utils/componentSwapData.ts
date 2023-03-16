import { BigNumber } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'
import { JsonRpcProvider } from '@ethersproject/providers'

import { DAI, USDC, USDT, WETH } from '../constants/tokens'
import { QuoteToken } from '../quote/quoteToken'

import { getIssuanceModule } from './issuanceModules'
import { Exchange, SwapData } from './swapData'
import { IndexTokenMix } from './wrapData'

export interface ComponentSwapData {
  underlyingERC20: string
  dexData: SwapData
  // ONLY relevant for issue, not used for redeem:
  // amount that has to be bought of the unwrapped token version (to cover required wrapped component amounts for issuance)
  // this amount has to be computed beforehand through the exchange rate of wrapped Component <> unwrappedComponent
  // i.e. getRequiredComponentIssuanceUnits() on the IssuanceModule and then convert units through exchange rate to unwrapped component units
  // e.g. 300 cDAI needed for issuance of 1 Set token. exchange rate 1cDAI = 0.05 DAI. -> buyUnderlyingAmount = 0.05 DAI * 300 = 15 DAI
  buyUnderlyingAmount: BigNumber
}
const IssuanceAbi = [
  'function getRequiredComponentIssuanceUnits(address _setToken, uint256 _quantity) external view returns (address[] memory, uint256[] memory, uint256[] memory)',
]

const dai = DAI.address!
const usdc = USDC.address!
const usdt = USDT.address!
const weth = WETH.address!

export async function getIssuanceComponentSwapData(
  indexToken: QuoteToken,
  inputToken: string,
  indexTokenAmount: BigNumber,
  provider: JsonRpcProvider
) {
  const issuanceModule = getIssuanceModule(indexToken.symbol)
  console.log(issuanceModule)
  const issuance = new Contract(issuanceModule.address, IssuanceAbi, provider)
  console.log(issuance.functions)
  // TODO: GET REQUIRED COMPONENTS
  const [
    issuanceComponents, // cDAI, cUSDC and cUSDT, in that order
    issuanceUnits,
  ] = await issuance.getRequiredComponentIssuanceUnits(
    indexToken.address,
    indexTokenAmount
  )
  const set_token_mix = IndexTokenMix.UNWRAPPED_ONLY
  console.log(issuanceComponents, issuanceUnits)
  // TODO: GET EXCHANGE RATES
  // TODO: GET SWAP DATA
}

function getStaticIssuanceSwapData(
  inputToken: string,
  outputToken: string
): SwapData {
  const inputTokenIsWeth = inputToken === weth
  return {
    exchange: Exchange.UniV3,
    path: inputTokenIsWeth
      ? [inputToken, outputToken]
      : [inputToken, weth, outputToken],
    fees: inputTokenIsWeth ? [3000] : [3000, 3000],
    pool: '0x0000000000000000000000000000000000000000',
  }
}

function getStaticRedemptionSwapData(
  inputToken: string,
  outputToken: string
): SwapData {
  const outputTokenIsWeth = outputToken === weth
  return {
    exchange: Exchange.UniV3,
    path: outputTokenIsWeth
      ? [inputToken, outputToken]
      : [inputToken, weth, outputToken],
    fees: outputTokenIsWeth ? [3000] : [3000, 3000],
    pool: '0x0000000000000000000000000000000000000000',
  }
}

export function getRedemptionComponentSwapData(
  outputToken: string
): ComponentSwapData[] {
  return [
    {
      underlyingERC20: dai,
      buyUnderlyingAmount: BigNumber.from(0), // not used in redeem
      dexData: getStaticRedemptionSwapData(dai, outputToken),
    },
    {
      underlyingERC20: usdc,
      buyUnderlyingAmount: BigNumber.from(0), // not used in redeem
      dexData: getStaticRedemptionSwapData(usdc, outputToken),
    },
    {
      underlyingERC20: usdt,
      buyUnderlyingAmount: BigNumber.from(0), // not used in redeem
      dexData: getStaticRedemptionSwapData(usdt, outputToken),
    },
  ]
}
