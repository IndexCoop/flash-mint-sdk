import { BigNumber } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'
import { Address, createPublicClient, http, parseAbi } from 'viem'
import { mainnet } from 'viem/chains'

import { AddressZero } from 'constants/addresses'
import { USDC } from 'constants/tokens'
import { SwapQuote, SwapQuoteProvider } from 'quote'
import { isSameAddress } from 'utils/addresses'
import { createClient } from 'utils/clients'
import { getIssuanceModule } from 'utils/issuanceModules'
import { getRpcProvider } from 'utils/rpc-provider'
import { Exchange, SwapData } from 'utils/swap-data'

// const DEFAULT_SLIPPAGE = 0.0015

const emptySwapData: SwapData = {
  exchange: Exchange.None,
  path: [],
  fees: [],
  pool: AddressZero,
}

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

interface ComponentSwapDataRequest {
  chainId: number
  indexTokenSymbol: string
  indexToken: string
  indexTokenAmount: BigNumber
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

interface IssuanceRequest extends ComponentSwapDataRequest {
  inputToken: string
}

export async function getIssuanceComponentSwapData(
  request: IssuanceRequest,
  rpcUrl: string,
  swapQuoteProvider: SwapQuoteProvider
): Promise<ComponentSwapData[]> {
  const {
    chainId,
    indexTokenSymbol,
    indexToken,
    indexTokenAmount,
    inputToken,
  } = request
  const issuance = getIssuanceContract(indexTokenSymbol, rpcUrl)
  const [issuanceComponents] = await issuance.getRequiredComponentIssuanceUnits(
    indexToken,
    indexTokenAmount
  )
  const underlyingERC20sPromises: Promise<WrappedToken>[] =
    issuanceComponents.map((component: string) =>
      getUnderlyingErc20(component, chainId)
    )
  const wrappedTokens = await Promise.all(underlyingERC20sPromises)
  // TODO:
  // const buyAmountsPromises = issuanceComponents.map(
  //   (component: string, index: number) =>
  //     getAmountOfAssetToObtainShares(component, issuanceUnits[index], provider)
  // )
  //   const buyAmounts = await Promise.all(buyAmountsPromises)
  const buyAmounts = issuanceComponents.map(() => BigNumber.from(0))
  const swapPromises: Promise<SwapQuote | null>[] = issuanceComponents.map(
    (_: string, index: number) => {
      const wrappedToken = wrappedTokens[index]
      const underlyingERC20 = wrappedToken.underlyingErc20
      if (isSameAddress(underlyingERC20.address, inputToken)) return null
      return swapQuoteProvider.getSwapQuote({
        chainId,
        inputToken,
        outputToken: underlyingERC20.address,
        outputAmount: buyAmounts[index].toString(),
        // TODO: needed for USDCY?
        //   includedSources: 'Uniswap_V3',
      })
    }
  )
  const swapData = await Promise.all(swapPromises)
  return buildComponentSwapData(
    issuanceComponents,
    wrappedTokens,
    buyAmounts,
    swapData
  )
}

interface RedemptionRequest extends ComponentSwapDataRequest {
  outputToken: string
}

export async function getRedemptionComponentSwapData(
  request: RedemptionRequest,
  rpcUrl: string,
  swapQuoteProvider: SwapQuoteProvider
): Promise<ComponentSwapData[]> {
  const {
    chainId,
    indexTokenSymbol,
    indexToken,
    indexTokenAmount,
    outputToken,
  } = request
  const issuance = getIssuanceContract(indexTokenSymbol, rpcUrl)
  const [issuanceComponents] =
    await issuance.getRequiredComponentRedemptionUnits(
      indexToken,
      indexTokenAmount
    )
  const underlyingERC20sPromises: Promise<WrappedToken>[] =
    issuanceComponents.map((component: string) =>
      getUnderlyingErc20(component, chainId)
    )
  const wrappedTokens = await Promise.all(underlyingERC20sPromises)
  // TODO: check google docs
  // const buyAmountsPromises = issuanceComponents.map(
  //   (component: string, index: number) =>
  //     getAmountOfAssetToObtainShares(
  //       component,
  //       issuanceUnits[index],
  //       provider,
  //       -DEFAULT_SLIPPAGE
  //     )
  // )
  // const buyAmounts = await Promise.all(buyAmountsPromises)
  const buyAmounts = issuanceComponents.map(() => BigNumber.from(0))
  const swapPromises: Promise<SwapQuote | null>[] = issuanceComponents.map(
    (_: string, index: number) => {
      const wrappedToken = wrappedTokens[index]
      const underlyingERC20 = wrappedToken.underlyingErc20
      if (isSameAddress(underlyingERC20.address, outputToken)) return null
      return swapQuoteProvider.getSwapQuote({
        chainId,
        inputToken: underlyingERC20.address,
        inputAmount: buyAmounts[index].toString(),
        outputToken,
        // TODO: needed for USDCY?
        //   includedSources: 'Uniswap_V3',
      })
    }
  )
  const swapData = await Promise.all(swapPromises)
  return buildComponentSwapData(
    issuanceComponents,
    wrappedTokens,
    buyAmounts,
    swapData
  )
}

function buildComponentSwapData(
  issuanceComponents: string[],
  wrappedTokens: WrappedToken[],
  buyAmounts: BigNumber[],
  swapDataResults: (SwapQuote | null)[]
): ComponentSwapData[] {
  return issuanceComponents.map((_: string, index: number) => {
    const wrappedToken = wrappedTokens[index]
    const buyUnderlyingAmount = buyAmounts[index]
    const dexData = swapDataResults[index]?.swapData ?? emptySwapData
    return {
      underlyingERC20: wrappedToken.underlyingErc20.address,
      buyUnderlyingAmount,
      dexData,
    }
  })
}

function getIssuanceContract(
  indexTokenSymbol: string,
  rpcUrl: string
): Contract {
  const abi = [
    'function getRequiredComponentIssuanceUnits(address _setToken, uint256 _quantity) external view returns (address[] memory, uint256[] memory, uint256[] memory)',
    'function getRequiredComponentRedemptionUnits(address _setToken, uint256 _quantity) external view returns (address[] memory, uint256[] memory, uint256[] memory)',
  ]
  const provider = getRpcProvider(rpcUrl)
  const issuanceModule = getIssuanceModule(indexTokenSymbol)
  return new Contract(issuanceModule.address, abi, provider)
}

async function getUnderlyingErc20(
  token: string,
  chainId: number
): Promise<WrappedToken> {
  const publicClient = createClient(chainId)!
  const decimals: number = await publicClient.readContract({
    address: token as Address,
    abi: parseAbi(['function decimals() view returns (uint8)']),
    functionName: 'decimals',
  })
  return {
    address: token,
    decimals,
    underlyingErc20: {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      address: USDC.address!,
      decimals: 6,
      symbol: USDC.symbol,
    },
  }
}
