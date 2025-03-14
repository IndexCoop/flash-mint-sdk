import { BigNumber } from '@ethersproject/bignumber'

import { getTokenByChainAndSymbol } from '@indexcoop/tokenlists'
import { FlashMintZeroExMainnetAddress } from 'constants/contracts'
import { getLocalHostProviderUrl, getTestRpcProvider } from 'tests/utils'
import { getFlashMintZeroExContractForToken } from 'utils/contracts'
import { getIssuanceModule } from 'utils/issuance-modules'
import { wei } from 'utils/numbers'
import {
  type FlashMintZeroExBuildRequest,
  ZeroExTransactionBuilder,
} from './zeroex'

const chainId = 1
const eth = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
const indexToken = getTokenByChainAndSymbol(chainId, 'cdETI')
const usdcAddress = getTokenByChainAndSymbol(chainId, 'USDC').address

describe('ZeroExTransactionBuilder()', () => {
  const contract = getFlashMintZeroExContractForToken(
    indexToken.symbol,
    getTestRpcProvider(chainId),
    chainId,
  )
  const issuanceModule = getIssuanceModule(indexToken.symbol, chainId)
  const rpcUrl = getLocalHostProviderUrl(chainId)

  test('returns null for invalid request (no index token)', async () => {
    const buildRequest = createBuildRequest()
    buildRequest.indexToken = ''
    const builder = new ZeroExTransactionBuilder(rpcUrl)
    const tx = await builder.build(buildRequest)
    expect(tx).toBeNull()
  })

  test('returns null for invalid request (no input/output token)', async () => {
    const buildRequest = createBuildRequest()
    buildRequest.inputOutputToken = ''
    const builder = new ZeroExTransactionBuilder(rpcUrl)
    const tx = await builder.build(buildRequest)
    expect(tx).toBeNull()
  })

  test('returns null for invalid request (indexTokenAmount = 0)', async () => {
    const buildRequest = createBuildRequest()
    buildRequest.indexTokenAmount = BigNumber.from(0)
    const builder = new ZeroExTransactionBuilder(rpcUrl)
    const tx = await builder.build(buildRequest)
    expect(tx).toBeNull()
  })

  test('returns null for invalid request (inputOutputTokenAmount = 0)', async () => {
    const buildRequest = createBuildRequest()
    buildRequest.inputOutputTokenAmount = BigNumber.from(0)
    const builder = new ZeroExTransactionBuilder(rpcUrl)
    const tx = await builder.build(buildRequest)
    expect(tx).toBeNull()
  })

  test('returns null for invalid request (no component quotes)', async () => {
    const buildRequest = createBuildRequest()
    buildRequest.componentQuotes = []
    const builder = new ZeroExTransactionBuilder(rpcUrl)
    const tx = await builder.build(buildRequest)
    expect(tx).toBeNull()
  })

  test('returns a tx for minting cdETI (ERC20)', async () => {
    const buildRequest = createBuildRequest()
    const refTx = await contract.populateTransaction.issueExactSetFromToken(
      buildRequest.indexToken,
      buildRequest.inputOutputToken,
      buildRequest.indexTokenAmount,
      buildRequest.inputOutputTokenAmount,
      buildRequest.componentQuotes,
      issuanceModule.address,
      issuanceModule.isDebtIssuance,
    )
    const builder = new ZeroExTransactionBuilder(rpcUrl)
    const tx = await builder.build(buildRequest)
    if (!tx) fail()
    expect(tx.to).toBe(FlashMintZeroExMainnetAddress)
    expect(tx.data).toEqual(refTx.data)
  })

  test('returns a tx for minting cdETI (ETH)', async () => {
    const buildRequest = createBuildRequest(true, eth, 'ETH')
    const refTx = await contract.populateTransaction.issueExactSetFromETH(
      buildRequest.indexToken,
      buildRequest.indexTokenAmount,
      buildRequest.componentQuotes,
      issuanceModule.address,
      issuanceModule.isDebtIssuance,
      { value: buildRequest.inputOutputTokenAmount },
    )
    const builder = new ZeroExTransactionBuilder(rpcUrl)
    const tx = await builder.build(buildRequest)
    if (!tx) fail()
    expect(tx.to).toBe(FlashMintZeroExMainnetAddress)
    expect(tx.data).toEqual(refTx.data)
    expect(tx.value).toEqual(buildRequest.inputOutputTokenAmount)
  })

  test('returns a tx for redeeming cdETI (ERC20)', async () => {
    const buildRequest = createBuildRequest(false)
    const refTx = await contract.populateTransaction.redeemExactSetForToken(
      buildRequest.indexToken,
      buildRequest.inputOutputToken,
      buildRequest.indexTokenAmount,
      buildRequest.inputOutputTokenAmount,
      buildRequest.componentQuotes,
      issuanceModule.address,
      issuanceModule.isDebtIssuance,
    )
    const builder = new ZeroExTransactionBuilder(rpcUrl)
    const tx = await builder.build(buildRequest)
    if (!tx) fail()
    expect(tx.to).toBe(FlashMintZeroExMainnetAddress)
    expect(tx.data).toEqual(refTx.data)
  })

  test('returns a tx for redeeming cdETI (ETH)', async () => {
    const buildRequest = createBuildRequest(false, eth, 'ETH')
    const refTx = await contract.populateTransaction.redeemExactSetForETH(
      buildRequest.indexToken,
      buildRequest.indexTokenAmount,
      buildRequest.inputOutputTokenAmount,
      buildRequest.componentQuotes,
      issuanceModule.address,
      issuanceModule.isDebtIssuance,
    )
    const builder = new ZeroExTransactionBuilder(rpcUrl)
    const tx = await builder.build(buildRequest)
    if (!tx) fail()
    expect(tx.to).toBe(FlashMintZeroExMainnetAddress)
    expect(tx.data).toEqual(refTx.data)
  })
})

function createBuildRequest(
  isMinting = true,
  inputOutputToken: string = usdcAddress,
  inputOutputTokenSymbol = 'USDC',
): FlashMintZeroExBuildRequest {
  return {
    isMinting,
    indexToken: indexToken.address,
    indexTokenSymbol: indexToken.symbol,
    inputOutputToken,
    inputOutputTokenSymbol,
    indexTokenAmount: wei(1),
    inputOutputTokenAmount: BigNumber.from(194235680),
    componentQuotes: [
      '0x6af479b20000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000371073f000000000000000000000000000000000000000000000000005f6c8c4012d2080000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002ba0b86991c6218b36c1d19d4a2e9eb0ce3606eb480001f47f39c581f595b53c5cb19bd0b3f8da6c935e2ca0000000000000000000000000000000000000000000869584cd000000000000000000000000100000000000000000000000000000000000001100000000000000000000000000000000000000000000007c981467f964423dbe',
      '0x6af479b20000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000518f6cc0000000000000000000000000000000000000000000000000093f687e9c782b600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000042a0b86991c6218b36c1d19d4a2e9eb0ce3606eb480001f4c02aaa39b223fe8d0a0e5c4f27ead9083c756cc20001f4ae78736cd615f374d3085123a210448e74fc6393000000000000000000000000000000000000000000000000000000000000869584cd0000000000000000000000001000000000000000000000000000000000000011000000000000000000000000000000000000000000000024136dbe9364423dbe',
      '0x6af479b20000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000309bc20000000000000000000000000000000000000000000000000005ec080151d048100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000042a0b86991c6218b36c1d19d4a2e9eb0ce3606eb480001f4c02aaa39b223fe8d0a0e5c4f27ead9083c756cc20001f4fe2e637202056d30016725477c5da089ab0a043a000000000000000000000000000000000000000000000000000000000000869584cd00000000000000000000000010000000000000000000000000000000000000110000000000000000000000000000000000000000000000dc3bdd52f864423dbe',
    ],
  }
}
