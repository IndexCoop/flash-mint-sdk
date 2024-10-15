import { BigNumber } from '@ethersproject/bignumber'

import { EthAddress } from 'constants/addresses'
import { ChainId } from 'constants/chains'
import { Contracts } from 'constants/contracts'
import {
  LocalhostProvider,
  LocalhostProviderUrl,
  QuoteTokens,
} from 'tests/utils'
import { getFlashMintHyEthContract } from 'utils/contracts'
import { wei } from 'utils/numbers'
import { Exchange } from 'utils/swap-data'
import { getComponentsSwapData } from 'quote/flashmint/hyeth/swap-data'

import {
  FlashMintHyEthBuildRequest,
  FlashMintHyEthTransactionBuilder,
} from './hyeth'

const provider = LocalhostProvider
const rpcUrl = LocalhostProviderUrl

const { hyeth, usdc, weth } = QuoteTokens

const FlashMintHyEthAddress = Contracts[ChainId.Mainnet].FlashMintHyEthV3
const eth = EthAddress
const indexToken = hyeth

describe('FlashMintHyEthTransactionBuilder()', () => {
  const contract = getFlashMintHyEthContract(provider)

  test('returns null for invalid request (no input token)', async () => {
    const buildRequest = createBuildRequest()
    buildRequest.inputToken = ''
    const builder = new FlashMintHyEthTransactionBuilder(rpcUrl)
    const tx = await builder.build(buildRequest)
    expect(tx).toBeNull()
  })

  test('returns null for invalid request (no output token)', async () => {
    const buildRequest = createBuildRequest()
    buildRequest.outputToken = ''
    const builder = new FlashMintHyEthTransactionBuilder(rpcUrl)
    const tx = await builder.build(buildRequest)
    expect(tx).toBeNull()
  })

  test('returns null for invalid request (indexTokenAmount = 0)', async () => {
    const buildRequest = createBuildRequest()
    // isMinting: true
    buildRequest.outputTokenAmount = BigNumber.from(0)
    const builder = new FlashMintHyEthTransactionBuilder(rpcUrl)
    const tx = await builder.build(buildRequest)
    expect(tx).toBeNull()
  })

  test('returns null for invalid request (inputTokenAmount = 0)', async () => {
    const buildRequest = createBuildRequest()
    // isMinting: true
    buildRequest.inputTokenAmount = BigNumber.from(0)
    const builder = new FlashMintHyEthTransactionBuilder(rpcUrl)
    const tx = await builder.build(buildRequest)
    expect(tx).toBeNull()
  })

  test('returns null for invalid request (no component quotes)', async () => {
    const buildRequest = createBuildRequest()
    buildRequest.componentsSwapData = []
    const builder = new FlashMintHyEthTransactionBuilder(rpcUrl)
    const tx = await builder.build(buildRequest)
    expect(tx).toBeNull()
  })

  // TODO:
  test.skip('returns a tx for minting hyETH (ERC20)', async () => {
    const buildRequest = createBuildRequest()
    const refTx = await contract.populateTransaction.issueExactSetFromERC20(
      buildRequest.outputToken,
      buildRequest.outputTokenAmount,
      buildRequest.inputToken,
      buildRequest.inputTokenAmount,
      buildRequest.swapDataInputTokenToEth,
      buildRequest.swapDataEthToInputOutputToken,
      buildRequest.componentsSwapData
    )
    const builder = new FlashMintHyEthTransactionBuilder(rpcUrl)
    const tx = await builder.build(buildRequest)
    if (!tx) fail()
    expect(tx.to).toBe(FlashMintHyEthAddress)
    expect(tx.data).toEqual(refTx.data)
  })

  test('returns a tx for minting hyETH (ETH)', async () => {
    const buildRequest = createBuildRequest(true, eth, 'ETH')
    const refTx = await contract.populateTransaction.issueExactSetFromETH(
      buildRequest.outputToken,
      buildRequest.outputTokenAmount,
      buildRequest.componentsSwapData,
      { value: buildRequest.inputTokenAmount }
    )
    const builder = new FlashMintHyEthTransactionBuilder(rpcUrl)
    const tx = await builder.build(buildRequest)
    if (!tx) fail()
    expect(tx.to).toBe(FlashMintHyEthAddress)
    expect(tx.data).toEqual(refTx.data)
    expect(tx.value).toEqual(buildRequest.inputTokenAmount)
  })

  // TODO:
  test.skip('returns a tx for redeeming hyETH (ERC20)', async () => {
    const buildRequest = createBuildRequest(
      false,
      indexToken.address,
      'hyETH',
      usdc.address,
      usdc.symbol
    )
    const refTx = await contract.populateTransaction.redeemExactSetForERC20(
      buildRequest.inputToken,
      buildRequest.inputTokenAmount,
      buildRequest.outputToken,
      buildRequest.outputTokenAmount,
      buildRequest.swapDataEthToInputOutputToken,
      buildRequest.componentsSwapData
    )
    const builder = new FlashMintHyEthTransactionBuilder(rpcUrl)
    const tx = await builder.build(buildRequest)
    if (!tx) fail()
    expect(tx.to).toBe(FlashMintHyEthAddress)
    expect(tx.data).toEqual(refTx.data)
  })

  test('returns a tx for redeeming hyETH (ETH)', async () => {
    const buildRequest = createBuildRequest(
      false,
      indexToken.address,
      'hyETH',
      eth,
      'ETH'
    )
    const refTx = await contract.populateTransaction.redeemExactSetForETH(
      buildRequest.inputToken,
      buildRequest.inputTokenAmount,
      buildRequest.outputTokenAmount,
      buildRequest.componentsSwapData
    )
    const builder = new FlashMintHyEthTransactionBuilder(rpcUrl)
    const tx = await builder.build(buildRequest)
    if (!tx) fail()
    expect(tx.to).toBe(FlashMintHyEthAddress)
    expect(tx.data).toEqual(refTx.data)
  })
})

function createBuildRequest(
  isMinting = true,
  inputToken: string = usdc.address,
  inputTokenSymbol: string = usdc.symbol,
  outputToken: string = indexToken.address,
  outputTokenSymbol: string = indexToken.symbol
): FlashMintHyEthBuildRequest {
  const swapDataInputTokenToEth = {
    exchange: Exchange.UniV3,
    path: [usdc.address, weth.address],
    fees: [500],
    pool: '0xDC24316b9AE028F1497c275EB9192a3Ea0f67022',
  }
  const swapDataEthToInputOutputToken = {
    exchange: Exchange.UniV3,
    path: [weth.address, usdc.address],
    fees: [500],
    pool: '0xDC24316b9AE028F1497c275EB9192a3Ea0f67022',
  }
  const componentsSwapData = getComponentsSwapData().map((swapData) => {
    return { ...swapData, poolIds: [] }
  })
  return {
    isMinting,
    inputToken,
    inputTokenSymbol,
    outputToken,
    outputTokenSymbol,
    inputTokenAmount: isMinting ? BigNumber.from(194235680) : wei(1),
    outputTokenAmount: isMinting ? wei(1) : BigNumber.from(194235680),
    componentsSwapData,
    swapDataInputTokenToEth,
    swapDataEthToInputOutputToken,
  }
}
