/* eslint-disable  @typescript-eslint/no-non-null-assertion */
import { BigNumber } from '@ethersproject/bignumber'

import { ChainId } from 'constants/chains'
import { Contracts } from 'constants/contracts'
import {
  HighYieldETHIndex,
  TheUSDCYieldIndex,
  USDC,
  WETH,
} from 'constants/tokens'
import { LocalhostProvider, LocalhostProviderUrl } from 'tests/utils'
import { getFlashMintNavContract } from 'utils/contracts'
import { wei } from 'utils/numbers'
import { Exchange } from 'utils'

import {
  FlashMintNavBuildRequest,
  FlashMintNavTransactionBuilder,
} from 'flashmint/builders/nav'

const provider = LocalhostProvider
const rpcUrl = LocalhostProviderUrl

const eth = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
const usdcAddress = '0xaf88d065e77c8cC2239327C5EDb3A432268e5831'

const FlashMintNavAddress = Contracts[ChainId.Mainnet].FlashMintNav

describe('FlashMintNavTransactionBuilder()', () => {
  const contract = getFlashMintNavContract(provider)

  test('returns null for invalid request (no index token)', async () => {
    const buildRequest = createBuildRequest()
    buildRequest.isMinting = true
    buildRequest.outputToken = ''
    const builder = new FlashMintNavTransactionBuilder(rpcUrl)
    const tx = await builder.build(buildRequest)
    expect(tx).toBeNull()
  })

  test('returns null for invalid request (no input/output token)', async () => {
    const buildRequest = createBuildRequest()
    buildRequest.inputToken = ''
    const builder = new FlashMintNavTransactionBuilder(rpcUrl)
    const tx = await builder.build(buildRequest)
    expect(tx).toBeNull()
  })

  test('returns null for invalid request (inputTokenAmount = 0)', async () => {
    const buildRequest = createBuildRequest()
    buildRequest.indexTokenAmount = BigNumber.from(0)
    const builder = new FlashMintNavTransactionBuilder(rpcUrl)
    const tx = await builder.build(buildRequest)
    expect(tx).toBeNull()
  })

  test('returns null for invalid request (outputTokenAmount = 0)', async () => {
    const buildRequest = createBuildRequest()
    buildRequest.inputOutputTokenAmount = BigNumber.from(0)
    const builder = new FlashMintNavTransactionBuilder(rpcUrl)
    const tx = await builder.build(buildRequest)
    expect(tx).toBeNull()
  })

  test('returns null for invalid request (invalid swap data debt collateral - no pool)', async () => {
    const buildRequest = createBuildRequest()
    buildRequest.reserveAssetSwapData = {
      exchange: 1,
      path: ['', ''],
      fees: [],
      poolIds: [],
      pool: '',
    }
    const builder = new FlashMintNavTransactionBuilder(rpcUrl)
    const tx = await builder.build(buildRequest)
    expect(tx).toBeNull()
  })

  test('returns null for invalid request (invalid swap data input/output token - no paths)', async () => {
    const buildRequest = createBuildRequest()
    buildRequest.reserveAssetSwapData = {
      exchange: 1,
      path: [],
      fees: [],
      poolIds: [],
      pool: '0x0000000000000000000000000000000000000000',
    }
    const builder = new FlashMintNavTransactionBuilder(rpcUrl)
    const tx = await builder.build(buildRequest)
    expect(tx).toBeNull()
  })

  test('returns null for invalid request (invalid swap data input/output token - univ3 fees)', async () => {
    const buildRequest = createBuildRequest()
    buildRequest.reserveAssetSwapData = {
      exchange: 3,
      path: ['', '', ''],
      // For UniV3 fees.length has to be path.length - 1
      fees: [3000],
      poolIds: [],
      pool: '0x0000000000000000000000000000000000000000',
    }
    const builder = new FlashMintNavTransactionBuilder(rpcUrl)
    const tx = await builder.build(buildRequest)
    expect(tx).toBeNull()
  })

  test('returns null for invalid request (invalid path - exchange type none)', async () => {
    const buildRequest = createBuildRequest()
    buildRequest.reserveAssetSwapData = {
      exchange: 0,
      path: [],
      fees: [500],
      poolIds: [],
      pool: '0x00000000000000000000000000000000000000',
    }
    const builder = new FlashMintNavTransactionBuilder(rpcUrl)
    const tx = await builder.build(buildRequest)
    expect(tx).toBeNull()
  })

  test('returns tx for correct swap data with exchange type none', async () => {
    const buildRequest = createBuildRequest()
    buildRequest.reserveAssetSwapData = {
      exchange: 0,
      path: [],
      fees: [500],
      poolIds: [],
      pool: '0x0000000000000000000000000000000000000000',
    }
    const builder = new FlashMintNavTransactionBuilder(rpcUrl)
    const tx = await builder.build(buildRequest)
    expect(tx).not.toBeNull()
  })

  test('returns a tx for minting icUSD (ERC20)', async () => {
    const buildRequest = createBuildRequest()
    buildRequest.isMinting = true
    const indexToken = buildRequest.outputToken
    const refTx = await contract.populateTransaction.issueSetFromExactERC20(
      indexToken,
      buildRequest.indexTokenAmount,
      buildRequest.inputToken,
      buildRequest.inputOutputTokenAmount,
      buildRequest.reserveAssetSwapData
    )
    const builder = new FlashMintNavTransactionBuilder(rpcUrl)
    const tx = await builder.build(buildRequest)
    if (!tx) fail()
    expect(tx.to).toBe(FlashMintNavAddress)
    expect(tx.data).toEqual(refTx.data)
  })

  test('returns a tx for minting icUSD (ETH)', async () => {
    const buildRequest = createBuildRequest(true, eth, 'ETH')
    const indexToken = buildRequest.outputToken
    const refTx = await contract.populateTransaction.issueSetFromExactETH(
      indexToken,
      buildRequest.indexTokenAmount,
      buildRequest.reserveAssetSwapData,
      { value: buildRequest.inputOutputTokenAmount }
    )
    const builder = new FlashMintNavTransactionBuilder(rpcUrl)
    const tx = await builder.build(buildRequest)
    if (!tx) fail()
    expect(tx.to).toBe(FlashMintNavAddress)
    expect(tx.data).toEqual(refTx.data)
    expect(tx.value).toEqual(buildRequest.inputOutputTokenAmount)
  })

  test('returns a tx for redeeming icUSD (ERC20)', async () => {
    const buildRequest = createBuildRequest(
      false,
      TheUSDCYieldIndex.addressArbitrum!,
      TheUSDCYieldIndex.symbol,
      usdcAddress,
      'USDC'
    )
    const refTx = await contract.populateTransaction.redeemExactSetForERC20(
      buildRequest.inputToken,
      buildRequest.indexTokenAmount,
      buildRequest.outputToken,
      buildRequest.inputOutputTokenAmount,
      buildRequest.reserveAssetSwapData
    )
    const builder = new FlashMintNavTransactionBuilder(rpcUrl)
    const tx = await builder.build(buildRequest)
    if (!tx) fail()
    expect(tx.to).toBe(FlashMintNavAddress)
    expect(tx.data).toEqual(refTx.data)
  })

  test('returns a tx for redeeming icUSD (ETH)', async () => {
    const buildRequest = createBuildRequest(
      false,
      TheUSDCYieldIndex.address!,
      TheUSDCYieldIndex.symbol,
      eth,
      'ETH'
    )
    const refTx = await contract.populateTransaction.redeemExactSetForETH(
      buildRequest.inputToken,
      buildRequest.indexTokenAmount,
      buildRequest.inputOutputTokenAmount,
      buildRequest.reserveAssetSwapData
    )
    const builder = new FlashMintNavTransactionBuilder(rpcUrl)
    const tx = await builder.build(buildRequest)
    if (!tx) fail()
    expect(tx.to).toBe(FlashMintNavAddress)
    expect(tx.data).toEqual(refTx.data)
  })
})

function createBuildRequest(
  isMinting = true,
  inputToken: string = usdcAddress,
  inputTokenSymbol = 'USDC',
  outputToken: string = HighYieldETHIndex.address!,
  outputTokenSymbol: string = HighYieldETHIndex.symbol
): FlashMintNavBuildRequest {
  const inputSwapData = {
    exchange: Exchange.UniV3,
    path: [USDC.address!, WETH.address!],
    fees: [500],
    poolIds: [],
    pool: '0xDC24316b9AE028F1497c275EB9192a3Ea0f67022',
  }
  const outputSwapData = {
    exchange: Exchange.UniV3,
    path: [WETH.address!, USDC.address!],
    fees: [500],
    poolIds: [],
    pool: '0xDC24316b9AE028F1497c275EB9192a3Ea0f67022',
  }
  return {
    isMinting,
    inputToken,
    inputTokenSymbol,
    outputToken,
    outputTokenSymbol,
    indexTokenAmount: wei(1),
    inputOutputTokenAmount: BigNumber.from(194235680),
    reserveAssetSwapData: isMinting ? inputSwapData : outputSwapData,
  }
}
