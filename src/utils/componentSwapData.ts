import { BigNumber } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'
import { JsonRpcProvider } from '@ethersproject/providers'

import { DAI, USDC, USDT, WETH } from '../constants/tokens'

import { getIssuanceModule } from './issuanceModules'
import { Exchange, SwapData } from './swapData'

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
  const [issuanceComponents, issuanceUnits] =
    await issuance.getRequiredComponentIssuanceUnits(
      indexToken,
      indexTokenAmount
    )
  const underlyingERC20sPromises: Promise<string>[] = issuanceComponents.map(
    (component: string) => getUnderlyingErc20(component, provider)
  )
  const underlyingERC20s = await Promise.all(underlyingERC20sPromises)
  const swapData = issuanceComponents.map((_: string, index: number) => {
    const underlyingERC20 = underlyingERC20s[index]
    return {
      underlyingERC20,
      buyUnderlyingAmount: issuanceUnits[index],
      dexData: getStaticIssuanceSwapData(inputToken, underlyingERC20),
    }
  })
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
  const underlyingERC20sPromises: Promise<string>[] = issuanceComponents.map(
    (component: string) => getUnderlyingErc20(component, provider)
  )
  const underlyingERC20s = await Promise.all(underlyingERC20sPromises)
  const swapData = issuanceComponents.map((_: string, index: number) => {
    const underlyingERC20 = underlyingERC20s[index]
    return {
      underlyingERC20,
      buyUnderlyingAmount: issuanceUnits[index],
      dexData: getStaticRedemptionSwapData(underlyingERC20, outputToken),
    }
  })
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

export async function getUnderlyingErc20(
  token: string,
  provider: JsonRpcProvider
): Promise<string> {
  const IERC4262_ABI = ['function asset() public view returns (address)']
  const contract = new Contract(token, IERC4262_ABI, provider)
  const underlyingERC20: string = await contract.asset()
  switch (underlyingERC20.toLowerCase()) {
    case dai.toLowerCase():
      return dai
    case usdc.toLowerCase():
      return usdc
    case usdt.toLowerCase():
      return usdt
    default:
      return ''
  }
}
