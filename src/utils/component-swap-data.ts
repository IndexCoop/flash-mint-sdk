import { BigNumber } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'
import { JsonRpcProvider } from '@ethersproject/providers'

import { DAI, USDC, USDT } from 'constants/tokens'
import { Exchange, SwapData } from 'utils/swap-data'

// import { ZeroExApi } from './0x'

// FIXME:
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

// const IssuanceAbi = [
//   'function getRequiredComponentIssuanceUnits(address _setToken, uint256 _quantity) external view returns (address[] memory, uint256[] memory, uint256[] memory)',
//   'function getRequiredComponentRedemptionUnits(address _setToken, uint256 _quantity) external view returns (address[] memory, uint256[] memory, uint256[] memory)',
// ]

// const erc4626Abi = [
//   'constructor(address _morpho, address _morphoToken, address _lens, address _recipient)',
//   'error ZeroAddress()',
//   'event Accrued(address indexed user, uint256 index, uint256 unclaimed)',
//   'event Approval(address indexed owner, address indexed spender, uint256 value)',
//   'event Claimed(address indexed user, uint256 claimed)',
//   'event Deposit(address indexed caller, address indexed owner, uint256 assets, uint256 shares)',
//   'event Initialized(uint8 version)',
//   'event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)',
//   'event RewardsTransferred(address recipient, uint256 amount)',
//   'event Transfer(address indexed from, address indexed to, uint256 value)',
//   'event Withdraw(address indexed caller, address indexed receiver, address indexed owner, uint256 assets, uint256 shares)',
//   'function allowance(address owner, address spender) view returns (uint256)',
//   'function approve(address spender, uint256 amount) returns (bool)',
//   'function asset() view returns (address)',
//   'function balanceOf(address account) view returns (uint256)',
//   'function claimRewards(address _user) returns (uint256 rewardsAmount)',
//   'function comp() view returns (address)',
//   'function convertToAssets(uint256 shares) view returns (uint256 assets)',
//   'function convertToShares(uint256 assets) view returns (uint256 shares)',
//   'function decimals() view returns (uint8)',
//   'function decreaseAllowance(address spender, uint256 subtractedValue) returns (bool)',
//   'function deposit(uint256 assets, address receiver) returns (uint256)',
//   'function increaseAllowance(address spender, uint256 addedValue) returns (bool)',
//   'function initialize(address _poolToken, string _name, string _symbol, uint256 _initialDeposit)',
//   'function lens() view returns (address)',
//   'function maxDeposit(address) view returns (uint256)',
//   'function maxMint(address) view returns (uint256)',
//   'function maxRedeem(address owner) view returns (uint256)',
//   'function maxWithdraw(address owner) view returns (uint256)',
//   'function mint(uint256 shares, address receiver) returns (uint256)',
//   'function morpho() view returns (address)',
//   'function morphoToken() view returns (address)',
//   'function name() view returns (string)',
//   'function owner() view returns (address)',
//   'function poolToken() view returns (address)',
//   'function previewDeposit(uint256 assets) view returns (uint256)',
//   'function previewMint(uint256 shares) view returns (uint256)',
//   'function previewRedeem(uint256 shares) view returns (uint256)',
//   'function previewWithdraw(uint256 assets) view returns (uint256)',
//   'function recipient() view returns (address)',
//   'function redeem(uint256 shares, address receiver, address owner) returns (uint256)',
//   'function renounceOwnership()',
//   'function rewardsIndex() view returns (uint256)',
//   'function symbol() view returns (string)',
//   'function totalAssets() view returns (uint256)',
//   'function totalSupply() view returns (uint256)',
//   'function transfer(address to, uint256 amount) returns (bool)',
//   'function transferFrom(address from, address to, uint256 amount) returns (bool)',
//   'function transferOwnership(address newOwner)',
//   'function transferRewards()',
//   'function userRewards(address) view returns (uint128 index, uint128 unclaimed)',
//   'function wEth() view returns (address)',
//   'function withdraw(uint256 assets, address receiver, address owner) returns (uint256)',
// ]

/* eslint-disable @typescript-eslint/no-non-null-assertion */
const dai = DAI.address!
const usdc = USDC.address!
const usdt = USDT.address!
/* eslint-enable @typescript-eslint/no-non-null-assertion */
// const DEFAULT_SLIPPAGE = 0.0015

const emptySwapData: SwapData = {
  exchange: Exchange.None,
  path: [
    '0x0000000000000000000000000000000000000000',
    '0x0000000000000000000000000000000000000000',
  ],
  fees: [],
  pool: '0x0000000000000000000000000000000000000000',
}

// const isFCASH = (address: string) =>
//   [
//     '0x278039398A5eb29b6c2FB43789a38A84C6085266',
//     '0xe09B1968851478f20a43959d8a212051367dF01A',
//   ].includes(address)

// const getAmountOfAssetToObtainShares = async () =>
//   component: string,
//   shares: BigNumber,
//   provider: JsonRpcProvider
//   slippage = DEFAULT_SLIPPAGE // 1 = 1%
//   {
//   const componentContract = new Contract(component, erc4626Abi, provider)
//   // Convert slippage to a BigNumber, do rounding to avoid weird JS precision loss
//   const defaultSlippageBN = BigNumber.from(Math.round(slippage * 10000))
//   // if FCASH, increase slippage x3
//   const slippageBigNumber = isFCASH(component)
//     ? defaultSlippageBN.mul(3)
//     : defaultSlippageBN

//   // Calculate the multiplier (1 + slippage)
//   const multiplier = BigNumber.from(10000).add(slippageBigNumber)

//   const buyUnderlyingAmount: BigNumber =
//     await componentContract.convertToAssets(shares)
//   return buyUnderlyingAmount.mul(multiplier).div(10000)
//   }

export async function getIssuanceComponentSwapData(): Promise<
  ComponentSwapData[]
> {
  //   const issuanceModule = getIssuanceModule(indexTokenSymbol)
  //   const issuance = new Contract(issuanceModule.address, IssuanceAbi, provider)
  //   const [issuanceComponents, issuanceUnits] =
  //     await issuance.getRequiredComponentIssuanceUnits(
  //       indexToken,
  //       indexTokenAmount
  //     )
  //   const underlyingERC20sPromises: Promise<WrappedToken>[] =
  //     issuanceComponents.map((component: string) =>
  //       getUnderlyingErc20(component, provider)
  //     )
  //   const buyAmountsPromises = issuanceComponents.map(
  //     (component: string, index: number) =>
  //       getAmountOfAssetToObtainShares(component, issuanceUnits[index], provider)
  //   )
  //   const buyAmounts = await Promise.all(buyAmountsPromises)
  //   const wrappedTokens = await Promise.all(underlyingERC20sPromises)
  //   const swaps: Promise<{ swapData: SwapData } | null>[] =
  //     issuanceComponents.map((_: string, index: number) => {
  //       const wrappedToken = wrappedTokens[index]
  //       const underlyingERC20 = wrappedToken.underlyingErc20
  //       const buyUnderlyingAmount = buyAmounts[index]
  //       const mintParams = {
  //         buyToken: underlyingERC20.address,
  //         buyAmount: buyUnderlyingAmount,
  //         sellToken: inputToken,
  //         includedSources: 'Uniswap_V3',
  //       }
  //       return getSwapData(mintParams, 0.1, 1, zeroExApi)
  //     })
  //   const swapDataResults = await Promise.all(swaps)
  //   const swapData = issuanceComponents.map((_: string, index: number) => {
  //     const wrappedToken = wrappedTokens[index]
  //     const underlyingERC20 = wrappedToken.underlyingErc20
  //     const buyUnderlyingAmount = buyAmounts[index]
  //     const dexData = swapDataResults[index]?.swapData ?? emptySwapData
  //     return {
  //       underlyingERC20: underlyingERC20.address,
  //       buyUnderlyingAmount,
  //       dexData,
  //     }
  //   })
  //   return swapData

  const swapData: ComponentSwapData = {
    underlyingERC20: usdc,
    buyUnderlyingAmount: BigNumber.from(0),
    dexData: emptySwapData,
  }
  return [swapData]
}

export async function getRedemptionComponentSwapData(): Promise<
  //   indexTokenSymbol: string,
  //   indexToken: string,
  //   outputToken: string,
  //   indexTokenAmount: BigNumber,
  //   provider: JsonRpcProvider
  //   zeroExApi: ZeroExApi
  ComponentSwapData[]
> {
  //   const issuanceModule = getIssuanceModule(indexTokenSymbol)
  //   const issuance = new Contract(issuanceModule.address, IssuanceAbi, provider)
  //   const [issuanceComponents, issuanceUnits] =
  //     await issuance.getRequiredComponentRedemptionUnits(
  //       indexToken,
  //       indexTokenAmount
  //     )
  //   const underlyingERC20sPromises: Promise<WrappedToken>[] =
  //     issuanceComponents.map((component: string) =>
  //       getUnderlyingErc20(component, provider)
  //     )
  //   const wrappedTokens = await Promise.all(underlyingERC20sPromises)
  //   const buyAmountsPromises = issuanceComponents.map(
  //     (component: string, index: number) =>
  //       getAmountOfAssetToObtainShares(
  //         component,
  //         issuanceUnits[index],
  //         provider,
  //         -DEFAULT_SLIPPAGE
  //       )
  //   )
  //   const buyAmounts = await Promise.all(buyAmountsPromises)
  //   const swaps = issuanceComponents.map((_: string, index: number) => {
  //     const wrappedToken = wrappedTokens[index]
  //     const underlyingERC20 = wrappedToken.underlyingErc20
  //     const buyUnderlyingAmount = buyAmounts[index]
  //     const redeemParams = {
  //       buyToken: outputToken,
  //       sellAmount: buyUnderlyingAmount,
  //       sellToken: underlyingERC20.address,
  //       includedSources: 'Uniswap_V3',
  //     }
  //     return getSwapData(redeemParams, 0.1, 1, zeroExApi)
  //   })
  //   const swapDataResults = await Promise.all(swaps)
  //   const swapData = issuanceComponents.map((_: string, index: number) => {
  //     const wrappedToken = wrappedTokens[index]
  //     const underlyingERC20 = wrappedToken.underlyingErc20
  //     const buyUnderlyingAmount = buyAmounts[index]
  //     const dexData = swapDataResults[index]?.swapData ?? emptySwapData
  //     return {
  //       underlyingERC20: underlyingERC20.address,
  //       buyUnderlyingAmount,
  //       dexData,
  //     }
  //   })
  const swapData: ComponentSwapData = {
    underlyingERC20: usdc,
    buyUnderlyingAmount: BigNumber.from(0),
    dexData: emptySwapData,
  }
  return [swapData]
}

async function getUnderlyingErc20(
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
