import { BigNumber } from '@ethersproject/bignumber'
import { getTokenByChainAndSymbol } from '@indexcoop/tokenlists'

import { ChainId } from 'constants/chains'
import { Contracts } from 'constants/contracts'
import { IndexCoopEthereum2xIndex, USDC, WETH } from 'constants/tokens'
import {
  type FlashMintLeveragedMorphoAaveLmBuildRequest,
  LeveragedMorphoAaveLmBuilder,
} from 'flashmint/builders/leveraged-morpho-aave'
import { getLocalHostProviderUrl } from 'tests/utils'
import { Exchange } from 'utils'
import { getFlashMintLeveragedContractForToken } from 'utils/contracts'
import { wei } from 'utils/numbers'
import { getRpcProvider } from 'utils/rpc-provider'

const chainId = ChainId.Base
const rpcUrl = getLocalHostProviderUrl(chainId)
const providerBase = getRpcProvider(rpcUrl)

const FlashMintLeveragedAerodromeAddress =
  Contracts[chainId].FlashMintLeveragedMorphoAaveLM
const eth = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
const usdcAddress = getTokenByChainAndSymbol(chainId, 'USDC').address

describe('LeveragedMorphoAaveLmBuilder()', () => {
  const contractBase = getFlashMintLeveragedContractForToken(
    getTokenByChainAndSymbol(chainId, 'BTC3X').symbol,
    providerBase,
    chainId,
  )

  beforeEach((): void => {
    jest.setTimeout(10000000)
  })

  test('returns null for invalid request (no index token)', async () => {
    const buildRequest = createBuildRequest()
    buildRequest.isMinting = true
    buildRequest.outputToken = ''
    const builder = new LeveragedMorphoAaveLmBuilder(rpcUrl)
    const tx = await builder.build(buildRequest)
    expect(tx).toBeNull()
  })

  test('returns null for invalid request (no input/output token)', async () => {
    const buildRequest = createBuildRequest()
    buildRequest.inputToken = ''
    const builder = new LeveragedMorphoAaveLmBuilder(rpcUrl)
    const tx = await builder.build(buildRequest)
    expect(tx).toBeNull()
  })

  test('returns null for invalid request (inputTokenAmount = 0)', async () => {
    const buildRequest = createBuildRequest()
    buildRequest.inputTokenAmount = BigNumber.from(0)
    const builder = new LeveragedMorphoAaveLmBuilder(rpcUrl)
    const tx = await builder.build(buildRequest)
    expect(tx).toBeNull()
  })

  test('returns null for invalid request (outputTokenAmount = 0)', async () => {
    const buildRequest = createBuildRequest()
    buildRequest.outputTokenAmount = BigNumber.from(0)
    const builder = new LeveragedMorphoAaveLmBuilder(rpcUrl)
    const tx = await builder.build(buildRequest)
    expect(tx).toBeNull()
  })

  test('returns null for invalid request (invalid swap data debt collateral - no pool)', async () => {
    const buildRequest = createBuildRequest()
    buildRequest.swapDataDebtCollateral = {
      exchange: 1,
      path: ['', ''],
      fees: [],
      pool: '',
      poolIds: [],
      tickSpacing: [500],
    }
    const builder = new LeveragedMorphoAaveLmBuilder(rpcUrl)
    const tx = await builder.build(buildRequest)
    expect(tx).toBeNull()
  })

  test('returns null for invalid request (invalid swap data input/output token - no paths)', async () => {
    const buildRequest = createBuildRequest()
    buildRequest.swapDataInputOutputToken = {
      exchange: 1,
      path: [],
      fees: [],
      pool: '0x0000000000000000000000000000000000000000',
      poolIds: [],
      tickSpacing: [500],
    }
    const builder = new LeveragedMorphoAaveLmBuilder(rpcUrl)
    const tx = await builder.build(buildRequest)
    expect(tx).toBeNull()
  })

  test('returns null for invalid request (invalid swap data input/output token - univ3 fees)', async () => {
    const buildRequest = createBuildRequest()
    buildRequest.swapDataInputOutputToken = {
      exchange: 3,
      path: ['', '', ''],
      // For UniV3 fees.length has to be path.length - 1
      fees: [3000],
      pool: '0x0000000000000000000000000000000000000000',
      poolIds: [],
      tickSpacing: [500],
    }
    const builder = new LeveragedMorphoAaveLmBuilder(rpcUrl)
    const tx = await builder.build(buildRequest)
    expect(tx).toBeNull()
  })

  test('returns null for invalid request (invalid path - exchange type none)', async () => {
    const buildRequest = createBuildRequest()
    buildRequest.swapDataInputOutputToken = {
      exchange: 0,
      path: [],
      fees: [500],
      pool: '0x00000000000000000000000000000000000000',
      poolIds: [],
      tickSpacing: [500],
    }
    const builder = new LeveragedMorphoAaveLmBuilder(rpcUrl)
    const tx = await builder.build(buildRequest)
    expect(tx).toBeNull()
  })

  test('returns tx for correct swap data with exchange type none', async () => {
    const buildRequest = createBuildRequest()
    buildRequest.swapDataInputOutputToken = {
      exchange: 0,
      path: [],
      fees: [500],
      pool: '0x0000000000000000000000000000000000000000',
      poolIds: [],
      tickSpacing: [500],
    }
    const builder = new LeveragedMorphoAaveLmBuilder(rpcUrl)
    const tx = await builder.build(buildRequest)
    expect(tx).not.toBeNull()
  })

  test('returns a tx for minting BTC2X (ETH) - Base', async () => {
    const btc2x = getTokenByChainAndSymbol(chainId, 'BTC2X')
    const buildRequest = createBuildRequest(
      true,
      eth,
      'ETH',
      btc2x.address,
      btc2x.symbol,
    )
    const refTx = await contractBase.populateTransaction.issueExactSetFromETH(
      buildRequest.outputToken,
      buildRequest.outputTokenAmount,
      buildRequest.swapDataDebtCollateral,
      buildRequest.swapDataInputOutputToken,
      { value: buildRequest.inputTokenAmount },
    )
    const builder = new LeveragedMorphoAaveLmBuilder(rpcUrl)
    const tx = await builder.build(buildRequest)
    if (!tx) fail()
    expect(tx.to).toBe(FlashMintLeveragedAerodromeAddress)
    expect(tx.data).toEqual(refTx.data)
    expect(tx.value).toEqual(buildRequest.inputTokenAmount)
  })

  test('returns a tx for redeeming ETH2X (ERC20) - Base', async () => {
    const buildRequest = createBuildRequest(
      false,
      IndexCoopEthereum2xIndex.addressBase!,
      IndexCoopEthereum2xIndex.symbol,
      usdcAddress,
      'USDC',
    )
    const refTx = await contractBase.populateTransaction.redeemExactSetForERC20(
      buildRequest.inputToken,
      buildRequest.inputTokenAmount,
      buildRequest.outputToken,
      buildRequest.outputTokenAmount,
      buildRequest.swapDataDebtCollateral,
      buildRequest.swapDataInputOutputToken,
    )
    const builder = new LeveragedMorphoAaveLmBuilder(rpcUrl)
    const tx = await builder.build(buildRequest)
    if (!tx) fail()
    expect(tx.to).toBe(FlashMintLeveragedAerodromeAddress)
    expect(tx.data).toEqual(refTx.data)
  })

  test('returns a tx for redeeming ETH2X (ETH) - Base', async () => {
    const buildRequest = createBuildRequest(
      false,
      IndexCoopEthereum2xIndex.addressBase!,
      IndexCoopEthereum2xIndex.symbol,
      eth,
      'ETH',
    )
    const refTx = await contractBase.populateTransaction.redeemExactSetForETH(
      buildRequest.inputToken,
      buildRequest.inputTokenAmount,
      buildRequest.outputTokenAmount,
      buildRequest.swapDataDebtCollateral,
      buildRequest.swapDataInputOutputToken,
    )
    const builder = new LeveragedMorphoAaveLmBuilder(rpcUrl)
    const tx = await builder.build(buildRequest)
    if (!tx) fail()
    expect(tx.to).toBe(FlashMintLeveragedAerodromeAddress)
    expect(tx.data).toEqual(refTx.data)
  })
})

function createBuildRequest(
  isMinting = true,
  inputToken: string = usdcAddress,
  inputTokenSymbol = 'USDC',
  outputToken: string = IndexCoopEthereum2xIndex.addressArbitrum!,
  outputTokenSymbol: string = IndexCoopEthereum2xIndex.symbol,
): FlashMintLeveragedMorphoAaveLmBuildRequest {
  const collateralDebtSwapData = {
    exchange: Exchange.UniV3,
    path: [USDC.addressArbitrum!, WETH.addressArbitrum!],
    fees: [100],
    pool: '0xDC24316b9AE028F1497c275EB9192a3Ea0f67022',
    poolIds: [],
    tickSpacing: [100],
  }
  const debtCollateralSwapData = {
    exchange: Exchange.UniV3,
    path: [WETH.addressArbitrum!, USDC.addressArbitrum!],
    fees: [100],
    pool: '0xDC24316b9AE028F1497c275EB9192a3Ea0f67022',
    poolIds: [],
    tickSpacing: [100],
  }
  const inputSwapData = {
    exchange: Exchange.UniV3,
    path: [USDC.addressArbitrum!, WETH.address!],
    fees: [100],
    pool: '0xDC24316b9AE028F1497c275EB9192a3Ea0f67022',
    poolIds: [],
    tickSpacing: [100],
  }
  const outputSwapData = {
    exchange: Exchange.UniV3,
    path: [WETH.addressArbitrum!, USDC.addressArbitrum!],
    fees: [100],
    pool: '0xDC24316b9AE028F1497c275EB9192a3Ea0f67022',
    poolIds: [],
    tickSpacing: [100],
  }
  return {
    chainId,
    isMinting,
    inputToken,
    inputTokenSymbol,
    outputToken,
    outputTokenSymbol,
    inputTokenAmount: wei(1),
    outputTokenAmount: BigNumber.from(194235680),
    swapDataDebtCollateral: isMinting
      ? collateralDebtSwapData
      : debtCollateralSwapData,
    swapDataInputOutputToken: isMinting ? inputSwapData : outputSwapData,
  }
}
