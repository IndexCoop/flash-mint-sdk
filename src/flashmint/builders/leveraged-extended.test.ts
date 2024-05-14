/* eslint-disable  @typescript-eslint/no-non-null-assertion */
import { BigNumber } from '@ethersproject/bignumber'

import { ChainId } from 'constants/chains'
import { FlashMintLeveragedExtendedAddress } from 'constants/contracts'
import { IndexCoopEthereum2xIndex, USDC, WETH } from 'constants/tokens'
import { noopSwapData } from 'constants/swapdata'
import { LocalhostProviderArbitrum } from 'tests/utils'
import { getFlashMintLeveragedContractForToken } from 'utils/contracts'
import { wei } from 'utils/numbers'
import { Exchange } from 'utils'

import {
  FlashMintLeveragedExtendedBuildRequest,
  LeveragedExtendedTransactionBuilder,
} from './leveraged-extended'

const chainId = ChainId.Arbitrum
const provider = LocalhostProviderArbitrum

const eth = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
const usdcAddress = '0xaf88d065e77c8cC2239327C5EDb3A432268e5831'

describe('LeveragedTransactionBuilder()', () => {
  const contract = getFlashMintLeveragedContractForToken(
    IndexCoopEthereum2xIndex.symbol,
    provider,
    chainId
  )

  beforeEach((): void => {
    jest.setTimeout(10000000)
  })

  test('returns null for invalid request (no index token)', async () => {
    const buildRequest = createBuildRequest()
    buildRequest.isMinting = true
    buildRequest.outputToken = ''
    const builder = new LeveragedExtendedTransactionBuilder(provider)
    const tx = await builder.build(buildRequest)
    expect(tx).toBeNull()
  })

  test('returns null for invalid request (no input/output token)', async () => {
    const buildRequest = createBuildRequest()
    buildRequest.inputToken = ''
    const builder = new LeveragedExtendedTransactionBuilder(provider)
    const tx = await builder.build(buildRequest)
    expect(tx).toBeNull()
  })

  test('returns null for invalid request (inputTokenAmount = 0)', async () => {
    const buildRequest = createBuildRequest()
    buildRequest.inputTokenAmount = BigNumber.from(0)
    const builder = new LeveragedExtendedTransactionBuilder(provider)
    const tx = await builder.build(buildRequest)
    expect(tx).toBeNull()
  })

  test('returns null for invalid request (outputTokenAmount = 0)', async () => {
    const buildRequest = createBuildRequest()
    buildRequest.outputTokenAmount = BigNumber.from(0)
    const builder = new LeveragedExtendedTransactionBuilder(provider)
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
    }
    const builder = new LeveragedExtendedTransactionBuilder(provider)
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
    }
    const builder = new LeveragedExtendedTransactionBuilder(provider)
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
    }
    const builder = new LeveragedExtendedTransactionBuilder(provider)
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
    }
    const builder = new LeveragedExtendedTransactionBuilder(provider)
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
    }
    const builder = new LeveragedExtendedTransactionBuilder(provider)
    const tx = await builder.build(buildRequest)
    expect(tx).not.toBeNull()
  })

  test('returns a tx for minting ETH2X (ERC20)', async () => {
    const buildRequest = createBuildRequest()
    buildRequest.isMinting = true
    const indexToken = buildRequest.outputToken
    const refTx = await contract.populateTransaction.issueExactSetFromERC20(
      indexToken,
      buildRequest.outputTokenAmount,
      buildRequest.inputToken,
      buildRequest.inputTokenAmount,
      buildRequest.swapDataDebtCollateral,
      buildRequest.swapDataInputOutputToken
    )
    const builder = new LeveragedExtendedTransactionBuilder(provider)
    const tx = await builder.build(buildRequest)
    if (!tx) fail()
    expect(tx.to).toBe(FlashMintLeveragedExtendedAddress)
    expect(tx.data).toEqual(refTx.data)
  })

  test('returns a tx for minting ETH2X (ETH)', async () => {
    const buildRequest = createBuildRequest(true, eth, 'ETH')
    const indexToken = buildRequest.outputToken
    const refTx = await contract.populateTransaction.issueExactSetFromETH(
      indexToken,
      buildRequest.outputTokenAmount,
      buildRequest.swapDataDebtCollateral,
      buildRequest.swapDataInputOutputToken,
      { value: buildRequest.inputTokenAmount }
    )
    const builder = new LeveragedExtendedTransactionBuilder(provider)
    const tx = await builder.build(buildRequest)
    if (!tx) fail()
    expect(tx.to).toBe(FlashMintLeveragedExtendedAddress)
    expect(tx.data).toEqual(refTx.data)
    expect(tx.value).toEqual(buildRequest.inputTokenAmount)
  })

  test('returns a tx for redeeming ETH2X (ERC20)', async () => {
    const buildRequest = createBuildRequest(
      false,
      IndexCoopEthereum2xIndex.addressArbitrum!,
      IndexCoopEthereum2xIndex.symbol,
      usdcAddress,
      'USDC'
    )
    const refTx = await contract.populateTransaction.redeemExactSetForERC20(
      buildRequest.inputToken,
      buildRequest.inputTokenAmount,
      buildRequest.outputToken,
      buildRequest.outputTokenAmount,
      buildRequest.swapDataDebtCollateral,
      buildRequest.swapDataInputOutputToken
    )
    const builder = new LeveragedExtendedTransactionBuilder(provider)
    const tx = await builder.build(buildRequest)
    if (!tx) fail()
    expect(tx.to).toBe(FlashMintLeveragedExtendedAddress)
    expect(tx.data).toEqual(refTx.data)
  })

  test('returns a tx for redeeming ETH2X (ETH)', async () => {
    const buildRequest = createBuildRequest(
      false,
      IndexCoopEthereum2xIndex.addressArbitrum!,
      IndexCoopEthereum2xIndex.symbol,
      eth,
      'ETH'
    )
    const refTx = await contract.populateTransaction.redeemExactSetForETH(
      buildRequest.inputToken,
      buildRequest.inputTokenAmount,
      buildRequest.outputTokenAmount,
      buildRequest.swapDataDebtCollateral,
      buildRequest.swapDataInputOutputToken
    )
    const builder = new LeveragedExtendedTransactionBuilder(provider)
    const tx = await builder.build(buildRequest)
    if (!tx) fail()
    expect(tx.to).toBe(FlashMintLeveragedExtendedAddress)
    expect(tx.data).toEqual(refTx.data)
  })
})

function createBuildRequest(
  isMinting = true,
  inputToken: string = usdcAddress,
  inputTokenSymbol = 'USDC',
  outputToken: string = IndexCoopEthereum2xIndex.addressArbitrum!,
  outputTokenSymbol: string = IndexCoopEthereum2xIndex.symbol
): FlashMintLeveragedExtendedBuildRequest {
  const collateralDebtSwapData = {
    exchange: Exchange.UniV3,
    path: [USDC.addressArbitrum!, WETH.addressArbitrum!],
    fees: [500],
    pool: '0xDC24316b9AE028F1497c275EB9192a3Ea0f67022',
  }
  const debtCollateralSwapData = {
    exchange: Exchange.UniV3,
    path: [WETH.addressArbitrum!, USDC.addressArbitrum!],
    fees: [500],
    pool: '0xDC24316b9AE028F1497c275EB9192a3Ea0f67022',
  }
  const inputSwapData = {
    exchange: Exchange.UniV3,
    path: [USDC.addressArbitrum!, WETH.address!],
    fees: [500],
    pool: '0xDC24316b9AE028F1497c275EB9192a3Ea0f67022',
  }
  const outputSwapData = {
    exchange: Exchange.UniV3,
    path: [WETH.addressArbitrum!, USDC.addressArbitrum!],
    fees: [500],
    pool: '0xDC24316b9AE028F1497c275EB9192a3Ea0f67022',
  }
  return {
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
    swapDataInputTokenForETH: noopSwapData,
    priceEstimateInflator: wei(0.9),
    maxDust: wei(0.00001),
  }
}
