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

interface WrappedToken {
  address: string
  decimals: number
  underlyingErc20: {
    address: string
    decimals: number
    symbol: string
  }
}

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
  const issuance = new Contract(issuanceModule.address, IssuanceAbi, provider)
  const [issuanceComponents, issuanceUnits] =
    await issuance.getRequiredComponentIssuanceUnits(
      indexToken,
      indexTokenAmount
    )
  const underlyingERC20sPromises: Promise<WrappedToken>[] =
    issuanceComponents.map((component: string) =>
      getUnderlyingErc20(component, provider)
    )
  const wrappedTokens = await Promise.all(underlyingERC20sPromises)
  const swapData = issuanceComponents.map((_: string, index: number) => {
    const wrappedToken = wrappedTokens[index]
    const underlyingERC20 = wrappedToken.underlyingErc20
    const buyUnderlyingAmount = fromWei(
      issuanceUnits[index],
      wrappedToken.decimals,
      underlyingERC20.decimals
    )
    return {
      underlyingERC20: underlyingERC20.address,
      buyUnderlyingAmount,
      dexData: getStaticIssuanceSwapData(inputToken, underlyingERC20.address),
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
  const underlyingERC20sPromises: Promise<WrappedToken>[] =
    issuanceComponents.map((component: string) =>
      getUnderlyingErc20(component, provider)
    )
  const wrappedTokens = await Promise.all(underlyingERC20sPromises)
  const swapData = issuanceComponents.map((_: string, index: number) => {
    const wrappedToken = wrappedTokens[index]
    const underlyingERC20 = wrappedToken.underlyingErc20
    return {
      underlyingERC20: underlyingERC20.address,
      buyUnderlyingAmount: issuanceUnits[index],
      dexData: getStaticRedemptionSwapData(
        underlyingERC20.address,
        outputToken
      ),
    }
  })
  return swapData
}

function fromWei(number: BigNumber, decimals: number, power: number = 18) {
  return number
    .mul(BigNumber.from(10).pow(power))
    .div(BigNumber.from(10).pow(decimals))
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
): Promise<WrappedToken | null> {
  const IERC4262_ABI = [
    'function asset() public view returns (address)',
    'function decimals() public view returns (uint256)',
  ]
  const contract = new Contract(token, IERC4262_ABI, provider)
  const underlyingERC20: string = await contract.asset()
  const decimals: number = await contract.decimals()
  switch (underlyingERC20.toLowerCase()) {
    case dai.toLowerCase():
      return {
        address: token,
        decimals,
        underlyingErc20: {
          address: dai,
          decimals: 18,
          symbol: DAI.symbol,
        },
      }
    case usdc.toLowerCase():
      return {
        address: token,
        decimals,
        underlyingErc20: {
          address: usdc,
          decimals: 6,
          symbol: USDC.symbol,
        },
      }
    case usdt.toLowerCase():
      return {
        address: token,
        decimals,
        underlyingErc20: {
          address: usdt,
          decimals: 6,
          symbol: USDT.symbol,
        },
      }
    default:
      return null
  }
}
