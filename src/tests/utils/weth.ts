/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { BigNumber } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'
import { Wallet } from '@ethersproject/wallet'
import { getTokenByChainAndSymbol } from '@indexcoop/tokenlists'

import { ChainId } from 'constants/chains'
export { wei } from 'utils/numbers'

export async function wrapETH(
  amount: BigNumber,
  signer: Wallet,
  chainId: number = ChainId.Mainnet
) {
  const abi = ['function deposit() public payable']
  const WETH9 = getTokenByChainAndSymbol(chainId, 'WETH')!.address
  const contract = new Contract(WETH9, abi, signer)
  const depositTokenInTx = await contract.deposit({
    gasLimit: 50_000,
    value: amount,
  })
  await depositTokenInTx.wait()
}
