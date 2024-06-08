import { Contract } from '@ethersproject/contracts'

import DEBT_ISSUANCE_MODULE_V2 from 'constants/abis/DebtIssuanceModuleV2.json'
import { getRpcProvider } from 'utils/rpc-provider'
import { getIssuanceModule } from 'utils'

import { FlashMintHyEthQuoteRequest } from './provider'

export async function getRequiredComponents(
  quoteRequest: FlashMintHyEthQuoteRequest,
  rpcUrl: string
) {
  const { isMinting, indexTokenAmount, inputToken, outputToken } = quoteRequest
  const indexToken = isMinting ? outputToken : inputToken
  const provider = getRpcProvider(rpcUrl)
  const issuance = getIssuanceModule(indexToken.symbol)
  const contract = new Contract(
    issuance.address,
    DEBT_ISSUANCE_MODULE_V2,
    provider
  )
  const [components, positions] = isMinting
    ? await contract.getRequiredComponentIssuanceUnits(
        indexToken.address,
        indexTokenAmount
      )
    : await contract.getRequiredComponentRedemptionUnits(
        indexToken.address,
        indexTokenAmount
      )
  return { components, positions }
}
