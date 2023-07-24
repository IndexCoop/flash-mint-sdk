import { BigNumber } from '@ethersproject/bignumber'

import {
  ExchangeIssuanceLeveragedMainnetAddress,
  FlashMintLeveragedAddress,
} from 'constants/contracts'
import {
  collateralDebtSwapData,
  debtCollateralSwapData,
  inputSwapData,
  outputSwapData,
} from 'constants/swapdata'
import { LocalhostProvider, QuoteTokens } from 'tests/utils'
import { getFlashMintLeveragedContractForToken } from 'utils/contracts'
import { wei } from 'utils/numbers'
import {
  FlashMintLeveragedBuildRequest,
  LeveragedTransactionBuilder,
} from './leveraged'

const chainId = 1
const provider = LocalhostProvider

const { iceth, reth, usdc } = QuoteTokens

const eth = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
const indexToken = iceth
const usdcAddress = usdc.address

describe('LeveragedTransactionBuilder()', () => {
  const contract = getFlashMintLeveragedContractForToken(
    indexToken.symbol,
    provider,
    chainId
  )

  beforeEach((): void => {
    jest.setTimeout(10000000)
  })

  test('returns null for invalid request (no index token)', async () => {
    const buildRequest = createBuildRequest()
    buildRequest.indexToken = ''
    const builder = new LeveragedTransactionBuilder(provider)
    const tx = await builder.build(buildRequest)
    expect(tx).toBeNull()
  })

  test('returns null for invalid request (no input/output token)', async () => {
    const buildRequest = createBuildRequest()
    buildRequest.inputOutputToken = ''
    const builder = new LeveragedTransactionBuilder(provider)
    const tx = await builder.build(buildRequest)
    expect(tx).toBeNull()
  })

  test('returns null for invalid request (indexTokenAmount = 0)', async () => {
    const buildRequest = createBuildRequest()
    buildRequest.indexTokenAmount = BigNumber.from(0)
    const builder = new LeveragedTransactionBuilder(provider)
    const tx = await builder.build(buildRequest)
    expect(tx).toBeNull()
  })

  test('returns null for invalid request (inputOutputTokenAmount = 0)', async () => {
    const buildRequest = createBuildRequest()
    buildRequest.inputOutputTokenAmount = BigNumber.from(0)
    const builder = new LeveragedTransactionBuilder(provider)
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
    const builder = new LeveragedTransactionBuilder(provider)
    const tx = await builder.build(buildRequest)
    expect(tx).toBeNull()
  })

  test('returns null for invalid request (invalid swap data payment token - no paths)', async () => {
    const buildRequest = createBuildRequest()
    buildRequest.swapDataPaymentToken = {
      exchange: 1,
      path: [],
      fees: [],
      pool: '0x0000000000000000000000000000000000000000',
    }
    const builder = new LeveragedTransactionBuilder(provider)
    const tx = await builder.build(buildRequest)
    expect(tx).toBeNull()
  })

  test('returns null for invalid request (invalid swap data payment token - univ3 fees)', async () => {
    const buildRequest = createBuildRequest()
    buildRequest.swapDataPaymentToken = {
      exchange: 3,
      path: ['', '', ''],
      // For UniV3 fees.length has to be path.length - 1
      fees: [3000],
      pool: '0x0000000000000000000000000000000000000000',
    }
    const builder = new LeveragedTransactionBuilder(provider)
    const tx = await builder.build(buildRequest)
    expect(tx).toBeNull()
  })

  test('returns null for invalid request (invalid path - exchange type none)', async () => {
    const buildRequest = createBuildRequest()
    buildRequest.swapDataPaymentToken = {
      exchange: 0,
      path: [],
      fees: [500],
      pool: '0x00000000000000000000000000000000000000',
    }
    const builder = new LeveragedTransactionBuilder(provider)
    const tx = await builder.build(buildRequest)
    expect(tx).toBeNull()
  })

  test('returns tx for correct swap data with exchange type none', async () => {
    const buildRequest = createBuildRequest()
    buildRequest.swapDataPaymentToken = {
      exchange: 0,
      path: [],
      fees: [500],
      pool: '0x0000000000000000000000000000000000000000',
    }
    const builder = new LeveragedTransactionBuilder(provider)
    const tx = await builder.build(buildRequest)
    expect(tx).not.toBeNull()
  })

  test('returns a tx for minting icETH (ERC20)', async () => {
    const buildRequest = createBuildRequest()
    const refTx = await contract.populateTransaction.issueExactSetFromERC20(
      buildRequest.indexToken,
      buildRequest.indexTokenAmount,
      buildRequest.inputOutputToken,
      buildRequest.inputOutputTokenAmount,
      buildRequest.swapDataDebtCollateral,
      buildRequest.swapDataPaymentToken
    )
    const builder = new LeveragedTransactionBuilder(provider)
    const tx = await builder.build(buildRequest)
    if (!tx) fail()
    expect(tx.to).toBe(ExchangeIssuanceLeveragedMainnetAddress)
    expect(tx.data).toEqual(refTx.data)
  })

  test('returns a tx for minting icETH (ETH)', async () => {
    const buildRequest = createBuildRequest(true, eth, 'ETH')
    const refTx = await contract.populateTransaction.issueExactSetFromETH(
      buildRequest.indexToken,
      buildRequest.indexTokenAmount,
      buildRequest.swapDataDebtCollateral,
      buildRequest.swapDataPaymentToken,
      { value: buildRequest.inputOutputTokenAmount }
    )
    const builder = new LeveragedTransactionBuilder(provider)
    const tx = await builder.build(buildRequest)
    if (!tx) fail()
    expect(tx.to).toBe(ExchangeIssuanceLeveragedMainnetAddress)
    expect(tx.data).toEqual(refTx.data)
    expect(tx.value).toEqual(buildRequest.inputOutputTokenAmount)
  })

  test('returns a tx for minting icRETH (rETH)', async () => {
    // FIXME: use custom swap data and custom build request
    const buildRequest = createBuildRequest(true, reth.address, 'rETH')
    const refTx = await contract.populateTransaction.issueExactSetFromETH(
      buildRequest.indexToken,
      buildRequest.indexTokenAmount,
      buildRequest.swapDataDebtCollateral,
      buildRequest.swapDataPaymentToken,
      { value: buildRequest.inputOutputTokenAmount }
    )
    const builder = new LeveragedTransactionBuilder(provider)
    const tx = await builder.build(buildRequest)
    if (!tx) fail()
    expect(tx.to).toBe(FlashMintLeveragedAddress)
    expect(tx.data).toEqual(refTx.data)
    expect(tx.value).toEqual(buildRequest.inputOutputTokenAmount)
  })

  test('returns a tx for redeeming dsETH (ERC20)', async () => {
    const buildRequest = createBuildRequest(false)
    const refTx = await contract.populateTransaction.redeemExactSetForERC20(
      buildRequest.indexToken,
      buildRequest.indexTokenAmount,
      buildRequest.inputOutputToken,
      buildRequest.inputOutputTokenAmount,
      buildRequest.swapDataDebtCollateral,
      buildRequest.swapDataPaymentToken
    )
    const builder = new LeveragedTransactionBuilder(provider)
    const tx = await builder.build(buildRequest)
    if (!tx) fail()
    expect(tx.to).toBe(ExchangeIssuanceLeveragedMainnetAddress)
    expect(tx.data).toEqual(refTx.data)
  })

  test('returns a tx for redeeming dsETH (ETH)', async () => {
    const buildRequest = createBuildRequest(false, eth, 'ETH')
    const refTx = await contract.populateTransaction.redeemExactSetForETH(
      buildRequest.indexToken,
      buildRequest.indexTokenAmount,
      buildRequest.inputOutputTokenAmount,
      buildRequest.swapDataDebtCollateral,
      buildRequest.swapDataPaymentToken
    )
    const builder = new LeveragedTransactionBuilder(provider)
    const tx = await builder.build(buildRequest)
    if (!tx) fail()
    expect(tx.to).toBe(ExchangeIssuanceLeveragedMainnetAddress)
    expect(tx.data).toEqual(refTx.data)
  })
})

function createBuildRequest(
  isMinting = true,
  inputOutputToken: string = usdcAddress,
  inputOutputTokenSymbol = 'USDC'
): FlashMintLeveragedBuildRequest {
  return {
    isMinting,
    indexToken: indexToken.address,
    indexTokenSymbol: indexToken.symbol,
    inputOutputToken,
    inputOutputTokenSymbol,
    indexTokenAmount: wei(1),
    inputOutputTokenAmount: BigNumber.from(194235680),
    swapDataDebtCollateral: isMinting
      ? collateralDebtSwapData[indexToken.symbol]
      : debtCollateralSwapData[indexToken.symbol],
    swapDataPaymentToken: isMinting
      ? inputSwapData[indexToken.symbol]['ETH']
      : outputSwapData[indexToken.symbol]['ETH'],
  }
}
