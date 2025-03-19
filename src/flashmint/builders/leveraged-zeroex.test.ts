import { BigNumber } from '@ethersproject/bignumber'
import { getTokenByChainAndSymbol } from '@indexcoop/tokenlists'

import { ChainId } from 'constants/chains'
import { Contracts } from 'constants/contracts'
import { LeveragedZeroExBuilder } from 'flashmint/builders/leveraged-zeroex'
import { getLocalHostProviderUrl } from 'tests/utils'
import { getFlashMintContract } from 'utils/contracts'
import { wei } from 'utils/numbers'
import { getRpcProvider } from 'utils/rpc-provider'

import type { FlashMintLeveragedZeroExBuilderBuildRequest } from 'flashmint/builders/leveraged-zeroex'
import type { SwapDataV2 } from 'utils/swap-data'

const chainId = ChainId.Base
const rpcUrl = getLocalHostProviderUrl(chainId)
const providerBase = getRpcProvider(rpcUrl)

const FlashMintLeveragedZeroExAddress =
  Contracts[chainId].FlashMintLeveragedZeroEx
const eth = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
const usdcAddress = getTokenByChainAndSymbol(chainId, 'USDC').address
const btc2x = getTokenByChainAndSymbol(chainId, 'BTC2X')

describe('LeveragedZeroExBuilder()', () => {
  const contractBase = getFlashMintContract(
    FlashMintLeveragedZeroExAddress,
    providerBase,
  )

  beforeEach((): void => {
    jest.setTimeout(10000000)
  })

  test('returns null for invalid request (no index token)', async () => {
    const buildRequest = createBuildRequest()
    buildRequest.isMinting = true
    buildRequest.outputToken = ''
    const builder = new LeveragedZeroExBuilder(rpcUrl)
    const tx = await builder.build(buildRequest)
    expect(tx).toBeNull()
  })

  test('returns null for invalid request (no input/output token)', async () => {
    const buildRequest = createBuildRequest()
    buildRequest.inputToken = ''
    const builder = new LeveragedZeroExBuilder(rpcUrl)
    const tx = await builder.build(buildRequest)
    expect(tx).toBeNull()
  })

  test('returns null for invalid request (inputTokenAmount = 0)', async () => {
    const buildRequest = createBuildRequest()
    buildRequest.inputTokenAmount = BigNumber.from(0)
    const builder = new LeveragedZeroExBuilder(rpcUrl)
    const tx = await builder.build(buildRequest)
    expect(tx).toBeNull()
  })

  test('returns null for invalid request (outputTokenAmount = 0)', async () => {
    const buildRequest = createBuildRequest()
    buildRequest.outputTokenAmount = BigNumber.from(0)
    const builder = new LeveragedZeroExBuilder(rpcUrl)
    const tx = await builder.build(buildRequest)
    expect(tx).toBeNull()
  })

  test('returns null for invalid request (invalid swap data debt collateral - no swap target)', async () => {
    const buildRequest = createBuildRequest()
    buildRequest.swapDataDebtCollateral = {
      swapTarget: '',
      callData: '0x',
    }
    const builder = new LeveragedZeroExBuilder(rpcUrl)
    const tx = await builder.build(buildRequest)
    expect(tx).toBeNull()
  })

  test('returns null for invalid request (invalid swap data input/output token - no call data)', async () => {
    const buildRequest = createBuildRequest()
    buildRequest.swapDataInputOutputToken = {
      swapTarget: '0x0000000000001fF3684f28c67538d4D072C22734',
      callData: '',
    }
    const builder = new LeveragedZeroExBuilder(rpcUrl)
    const tx = await builder.build(buildRequest)
    expect(tx).toBeNull()
  })

  test('returns a tx for minting with ETH - Base', async () => {
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
      buildRequest.isAave,
      { value: buildRequest.inputTokenAmount },
    )
    const builder = new LeveragedZeroExBuilder(rpcUrl)
    const tx = await builder.build(buildRequest)
    if (!tx) fail()
    expect(tx.to).toBe(FlashMintLeveragedZeroExAddress)
    expect(tx.data).toEqual(refTx.data)
    expect(tx.value).toEqual(buildRequest.inputTokenAmount)
  })

  test('returns a tx for redeeming to ERC20 - Base', async () => {
    const buildRequest = createBuildRequest(
      false,
      btc2x.address,
      btc2x.symbol,
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
      buildRequest.isAave,
    )
    const builder = new LeveragedZeroExBuilder(rpcUrl)
    const tx = await builder.build(buildRequest)
    if (!tx) fail()
    expect(tx.to).toBe(FlashMintLeveragedZeroExAddress)
    expect(tx.data).toEqual(refTx.data)
  })

  test('returns a tx for redeeming to ETH - Base', async () => {
    const buildRequest = createBuildRequest(
      false,
      btc2x.address,
      btc2x.symbol,
      eth,
      'ETH',
    )
    const refTx = await contractBase.populateTransaction.redeemExactSetForETH(
      buildRequest.inputToken,
      buildRequest.inputTokenAmount,
      buildRequest.outputTokenAmount,
      buildRequest.swapDataDebtCollateral,
      buildRequest.swapDataInputOutputToken,
      buildRequest.isAave,
    )
    const builder = new LeveragedZeroExBuilder(rpcUrl)
    const tx = await builder.build(buildRequest)
    if (!tx) fail()
    expect(tx.to).toBe(FlashMintLeveragedZeroExAddress)
    expect(tx.data).toEqual(refTx.data)
  })
})

function createBuildRequest(
  isMinting = true,
  inputToken: string = usdcAddress,
  inputTokenSymbol = 'USDC',
  outputToken: string = btc2x.address,
  outputTokenSymbol: string = btc2x.symbol,
): FlashMintLeveragedZeroExBuilderBuildRequest {
  const collateralDebtSwapData: SwapDataV2 = {
    swapTarget: '0x0000000000001fF3684f28c67538d4D072C22734',
    callData: '0x',
  }
  const debtCollateralSwapData = {
    swapTarget: '0x0000000000001fF3684f28c67538d4D072C22734',
    callData: '0x',
  }
  const inputSwapData = {
    swapTarget: '0x0000000000001fF3684f28c67538d4D072C22734',
    callData: '0x',
  }
  const outputSwapData = {
    swapTarget: '0x0000000000001fF3684f28c67538d4D072C22734',
    callData: '0x',
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
    isAave: false,
  }
}
