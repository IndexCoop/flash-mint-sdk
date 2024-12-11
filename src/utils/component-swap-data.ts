import { BigNumber } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'
import { getTokenByChainAndSymbol, isAddressEqual } from '@indexcoop/tokenlists'
import { Address, parseAbi } from 'viem'

import { AddressZero } from 'constants/addresses'
import { SwapQuote, SwapQuoteProvider } from 'quote'
import { isSameAddress } from 'utils/addresses'
import { createClient } from 'utils/clients'
import { getIssuanceModule } from 'utils/issuanceModules'
import { getRpcProvider } from 'utils/rpc-provider'
import { Exchange, SwapDataV3 } from 'utils/swap-data'

// const DEFAULT_SLIPPAGE = 0.0015

const emptySwapData: SwapDataV3 = {
  exchange: Exchange.None,
  path: [],
  fees: [],
  pool: AddressZero,
  poolIds: [],
}

export interface ComponentSwapData {
  underlyingERC20: string
  dexData: SwapDataV3
  // ONLY relevant for issue, not used for redeem:
  // amount that has to be bought of the unwrapped token version (to cover required wrapped component amounts for issuance)
  // this amount has to be computed beforehand through the exchange rate of wrapped component <> unwrapped component
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
  const issuance = getIssuanceContract(chainId, indexTokenSymbol, rpcUrl)
  const [issuanceComponents, issuanceUnits] =
    await issuance.getRequiredComponentIssuanceUnits(
      indexToken,
      indexTokenAmount
    )
  const underlyingERC20sPromises: Promise<WrappedToken>[] =
    issuanceComponents.map((component: string) =>
      getUnderlyingErc20(component, chainId)
    )
  const units = issuanceUnits.map((unit: BigNumber) => unit.toString())
  const amountPromises = issuanceComponents.map(
    (component: Address, index: number) =>
      getAmount(true, component, BigInt(units[index]), chainId)
  )
  const wrappedTokens = await Promise.all(underlyingERC20sPromises)
  const amounts: bigint[] = await Promise.all(amountPromises)
  const swapPromises: Promise<SwapQuote | null>[] = issuanceComponents.map(
    (_: string, index: number) => {
      const wrappedToken = wrappedTokens[index]
      const underlyingERC20 = wrappedToken.underlyingErc20
      if (isSameAddress(underlyingERC20.address, inputToken)) return null
      return swapQuoteProvider.getSwapQuote({
        chainId,
        inputToken,
        outputToken: underlyingERC20.address,
        outputAmount: amounts[index].toString(),
        sources: [Exchange.UniV3],
      })
    }
  )
  const swapData = await Promise.all(swapPromises)
  return buildComponentSwapData(
    issuanceComponents,
    wrappedTokens,
    amounts,
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
  const issuance = getIssuanceContract(chainId, indexTokenSymbol, rpcUrl)
  const [issuanceComponents, issuanceUnits] =
    await issuance.getRequiredComponentRedemptionUnits(
      indexToken,
      indexTokenAmount
    )
  const underlyingERC20sPromises: Promise<WrappedToken>[] =
    issuanceComponents.map((component: string) =>
      getUnderlyingErc20(component, chainId)
    )
  const amountPromises = issuanceComponents.map(
    (component: Address, index: number) =>
      getAmount(false, component, issuanceUnits[index].toBigInt(), chainId)
  )
  const wrappedTokens = await Promise.all(underlyingERC20sPromises)
  const amounts = await Promise.all(amountPromises)
  const swapPromises: Promise<SwapQuote | null>[] = issuanceComponents.map(
    (_: string, index: number) => {
      const wrappedToken = wrappedTokens[index]
      const underlyingERC20 = wrappedToken.underlyingErc20
      if (isSameAddress(underlyingERC20.address, outputToken)) return null
      return swapQuoteProvider.getSwapQuote({
        chainId,
        inputToken: underlyingERC20.address,
        inputAmount: amounts[index].toString(),
        outputToken,
        sources: [Exchange.UniV3],
      })
    }
  )
  const swapData = await Promise.all(swapPromises)
  return buildComponentSwapData(
    issuanceComponents,
    wrappedTokens,
    amounts,
    swapData
  )
}

function buildComponentSwapData(
  issuanceComponents: string[],
  wrappedTokens: WrappedToken[],
  buyAmounts: bigint[],
  swapDataResults: (SwapQuote | null)[]
): ComponentSwapData[] {
  return issuanceComponents.map((_: string, index: number) => {
    const wrappedToken = wrappedTokens[index]
    const buyUnderlyingAmount = BigNumber.from(buyAmounts[index].toString())
    const swapData = swapDataResults[index]?.swapData
    const dexData: SwapDataV3 = swapData
      ? {
          exchange: swapData.exchange,
          path: swapData.path,
          fees: swapData.fees,
          pool: swapData.pool,
          poolIds: [],
        }
      : emptySwapData
    return {
      underlyingERC20: wrappedToken.underlyingErc20.address,
      buyUnderlyingAmount,
      dexData,
    }
  })
}

async function getAmount(
  isMinting: boolean,
  component: Address,
  issuanceUnits: bigint,
  chainId: number
): Promise<bigint> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const publicClient = createClient(chainId)!
    const erc4626Abi = [
      'function convertToAssets(uint256 shares) view returns (uint256 assets)',
      'function previewMint(uint256 shares) view returns (uint256 assets)',
      'function previewRedeem(uint256 shares) view returns (uint256 assets)',
    ]
    const preview: bigint = (await publicClient.readContract({
      address: component as Address,
      abi: parseAbi(erc4626Abi),
      functionName: isMinting ? 'previewMint' : 'previewRedeem',
      args: [issuanceUnits],
    })) as bigint
    if (isMinting) {
      return (preview * BigInt(1001)) / BigInt(1000)
    } else {
      return (preview * BigInt(999)) / BigInt(1000)
    }
  } catch {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const usdc = getTokenByChainAndSymbol(chainId, 'USDC')!
    if (isAddressEqual(component, usdc)) return issuanceUnits
    // Apply slippage to issuance units amount (for all none erc4262)
    if (isMinting) {
      return (issuanceUnits * BigInt(1005)) / BigInt(1000)
    } else {
      return (issuanceUnits * BigInt(995)) / BigInt(1000)
    }
  }
}

function getIssuanceContract(
  chainId: number,
  indexTokenSymbol: string,
  rpcUrl: string
): Contract {
  const abi = [
    'function getRequiredComponentIssuanceUnits(address _setToken, uint256 _quantity) external view returns (address[] memory, uint256[] memory, uint256[] memory)',
    'function getRequiredComponentRedemptionUnits(address _setToken, uint256 _quantity) external view returns (address[] memory, uint256[] memory, uint256[] memory)',
  ]
  const provider = getRpcProvider(rpcUrl)
  const issuanceModule = getIssuanceModule(indexTokenSymbol, chainId)
  return new Contract(issuanceModule.address, abi, provider)
}

async function getUnderlyingErc20(
  token: string,
  chainId: number
): Promise<WrappedToken> {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const publicClient = createClient(chainId)!
  const decimals: number = await publicClient.readContract({
    address: token as Address,
    abi: parseAbi(['function decimals() view returns (uint8)']),
    functionName: 'decimals',
  })
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const usdc = getTokenByChainAndSymbol(chainId, 'USDC')!
  return {
    address: token,
    decimals,
    underlyingErc20: {
      address: usdc.address,
      decimals: usdc.decimals,
      symbol: usdc.symbol,
    },
  }
}
