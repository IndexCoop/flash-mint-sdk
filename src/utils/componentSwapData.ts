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
  'function getRequiredComponentRedemptionUnits(address _setToken, uint256 _quantity) external view returns (address[] memory, uint256[] memory, uint256[] memory)',
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
  // TODO: check returns
  const [
    issuanceComponents, // cDAI, cUSDC and cUSDT, in that order
    issuanceUnits,
  ] = await issuance.getRequiredComponentIssuanceUnits(
    indexToken,
    indexTokenAmount
  )

  const indexTokenMix = getIndexTokenMix(indexTokenSymbol)
  console.log(indexTokenMix)
  console.log(
    issuanceComponents,
    issuanceUnits.map((unit: BigNumber) => unit.toString())
  )

  // const cDaiExchangeRate = await getExchangeRate(
  //   '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643',
  //   18,
  //   provider
  // )
  // const cUsdcExchangeRate = await getExchangeRate(
  //   '0x39AA39c021dfbaE8faC545936693aC917d5E7563',
  //   6,
  //   provider
  // )
  // const cUsdtExchangeRate = await getExchangeRate(
  //   '0xf650C3d88D12dB855b8bf7D11Be6C55A4e07dCC9',
  //   6,
  //   provider
  // )

  // const requiredDai = issuanceUnits[0].mul(cDaiExchangeRate)
  // const requiredUsdc = issuanceUnits[1].mul(cUsdcExchangeRate)
  // const requiredUsdt = issuanceUnits[2].mul(cUsdtExchangeRate)

  // console.log(requiredDai.toString())
  // console.log(requiredUsdc.toString())
  // console.log(requiredUsdt.toString())

  // const buyUnderlyingAmountDai =
  //   indexTokenMix !== IndexTokenMix.UNWRAPPED_ONLY
  //     ? requiredDai
  //     : issuanceUnits[0]
  // // cUSDC is only used in test case WRAPPED_ONLY
  // const buyUnderlyingAmountUsdc =
  //   indexTokenMix === IndexTokenMix.WRAPPED_ONLY
  //     ? requiredUsdc
  //     : issuanceUnits[1]
  // const buyUnderlyingAmountUsdt =
  //   indexTokenMix !== IndexTokenMix.UNWRAPPED_ONLY
  //     ? requiredUsdt
  //     : issuanceUnits[2]

  const swapData = issuanceComponents.map(
    (component: string, index: number) => {
      const underlyingERC20 = getUnderlyingErc20(component)
      return {
        underlyingERC20,
        buyUnderlyingAmount: issuanceUnits[index],
        dexData: getStaticIssuanceSwapData(inputToken, underlyingERC20),
      }
    }
  )
  return swapData
}

export async function getRedemptionComponentSwapData(
  indexTokenSymbol: string,
  indexToken: string,
  outputToken: string,
  indexTokenAmount: BigNumber,
  provider: JsonRpcProvider
): Promise<ComponentSwapData[]> {
  const issuanceModule = getIssuanceModule(indexTokenSymbol)
  const issuance = new Contract(issuanceModule.address, IssuanceAbi, provider)
  const [issuanceComponents, issuanceUnits] =
    await issuance.getRequiredComponentRedemptionUnits(
      indexToken,
      indexTokenAmount
    )
  const swapData = issuanceComponents.map(
    (component: string, index: number) => {
      const underlyingERC20 = getUnderlyingErc20(component)
      return {
        underlyingERC20,
        buyUnderlyingAmount: issuanceUnits[index],
        dexData: getStaticRedemptionSwapData(underlyingERC20, outputToken),
      }
    }
  )
  return swapData
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

export function getUnderlyingErc20(token: string): string {
  switch (token) {
    // wfDAI:1695168000 (Wrapped fDAI @ 1695168000)
    // wfDAI:1687392000 (Wrapped fDAI @ 1687392000)
    case '0x278039398A5eb29b6c2FB43789a38A84C6085266':
    case '0xfa5d4F65a4c51906652d78140C266423111c6BFA':
      return dai
    // mcUSDC (Morpho-Compound USD Coin Supply Vault)
    // wfUSDC:1695168000 (Wrapped fUSDC @ 1695168000)
    case '0xba9E3b3b684719F80657af1A19DEbc3C772494a0':
    case '0xe09B1968851478f20a43959d8a212051367dF01A':
      return usdc
    // maUSDT (Morpho-Aave Tether USD Supply Vault )
    // mcUSDT (Morpho-Compound Tether USD Supply Vault)
    case '0xAFe7131a57E44f832cb2dE78ade38CaD644aaC2f':
    case '0xC2A4fBA93d4120d304c94E4fd986e0f9D213eD8A':
      return usdt
    default:
      return ''
  }
}
