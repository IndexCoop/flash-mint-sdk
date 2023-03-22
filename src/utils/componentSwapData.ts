import { BigNumber } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'
import { JsonRpcProvider } from '@ethersproject/providers'

import { DAI, USDC, USDT, WETH } from '../constants/tokens'

import { getIssuanceModule } from './issuanceModules'
import { Exchange, SwapData } from './swapData'
import { getIndexTokenMix, IndexTokenMix } from './wrapData'

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

const CErc20Abi = ['function exchangeRateCurrent() public returns (uint)']

const IssuanceAbi = [
  'function getRequiredComponentIssuanceUnits(address _setToken, uint256 _quantity) external view returns (address[] memory, uint256[] memory, uint256[] memory)',
]

const dai = DAI.address!
const usdc = USDC.address!
const usdt = USDT.address!
const weth = WETH.address!

export async function getIssuanceComponentSwapData(
  indexTokenSymbol: string,
  indexToken: string,
  inputToken: string,
  indexTokenAmount: BigNumber,
  provider: JsonRpcProvider
): Promise<ComponentSwapData[]> {
  const issuanceModule = getIssuanceModule(indexTokenSymbol)
  console.log(issuanceModule)
  const issuance = new Contract(issuanceModule.address, IssuanceAbi, provider)
  console.log(issuance.functions)
  // TODO: check returns
  const [
    issuanceComponents, // cDAI, cUSDC and cUSDT, in that order
    issuanceUnits,
  ] = await issuance.getRequiredComponentIssuanceUnits(
    indexToken,
    indexTokenAmount
  )

  const indexTokenMix = getIndexTokenMix(indexTokenSymbol)
  console.log(issuanceComponents, issuanceUnits)
  console.log(indexTokenMix)

  const cDaiExchangeRate = await getExchangeRate(
    '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643',
    18,
    provider
  )
  const cUsdcExchangeRate = await getExchangeRate(
    '0x39AA39c021dfbaE8faC545936693aC917d5E7563',
    6,
    provider
  )
  const cUsdtExchangeRate = await getExchangeRate(
    '0xf650C3d88D12dB855b8bf7D11Be6C55A4e07dCC9',
    6,
    provider
  )

  const requiredDai = issuanceUnits[0].mul(cDaiExchangeRate)
  const requiredUsdc = issuanceUnits[1].mul(cUsdcExchangeRate)
  // const requiredUsdt = issuanceUnits[2].mul(cUsdtExchangeRate)

  console.log(requiredDai.toString())
  console.log(requiredUsdc.toString())
  // console.log(requiredUsdt.toString())

  const buyUnderlyingAmountDai =
    indexTokenMix !== IndexTokenMix.UNWRAPPED_ONLY
      ? requiredDai
      : issuanceUnits[0]
  // cUSDC is only used in test case WRAPPED_ONLY
  const buyUnderlyingAmountUsdc =
    indexTokenMix === IndexTokenMix.WRAPPED_ONLY
      ? requiredUsdc
      : issuanceUnits[1]
  // const buyUnderlyingAmountUsdt =
  //   indexTokenMix !== IndexTokenMix.UNWRAPPED_ONLY
  //     ? requiredUsdt
  //     : issuanceUnits[2]

  return [
    {
      underlyingERC20: dai,
      buyUnderlyingAmount: buyUnderlyingAmountDai,
      dexData: getStaticIssuanceSwapData(inputToken, dai),
    },
    {
      underlyingERC20: usdc,
      buyUnderlyingAmount: buyUnderlyingAmountUsdc,
      dexData: getStaticIssuanceSwapData(inputToken, usdc),
    },
    {
      underlyingERC20: usdt,
      buyUnderlyingAmount: BigNumber.from(0),
      dexData: getStaticIssuanceSwapData(inputToken, usdt),
    },
  ]
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

async function getExchangeRate(
  cErc20: string,
  decimals: number,
  provider: JsonRpcProvider
): Promise<BigNumber> {
  const contract = new Contract(cErc20, CErc20Abi, provider)
  // Returns the current exchange rate as an unsigned integer, scaled by 1 * 10^(18 - 8 + Underlying Token Decimals).
  // 8 because cTokens have 8 decimals.
  // https://docs.compound.finance/v2/ctokens/#exchange-rate
  const exchangeRate = await contract.callStatic.exchangeRateCurrent()
  const scale = Math.pow(10, 18 - 8 + decimals)
  const divByScale = Math.pow(10, decimals - 8)
  console.log(scale, divByScale)
  console.log(exchangeRate.toString(), '/////// exchange rate scaled')
  const realExchangeRate =
    scale > 1e18 ? exchangeRate.div(divByScale) : exchangeRate
  console.log(realExchangeRate.toString(), '/////// exchange rate')
  return realExchangeRate
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
