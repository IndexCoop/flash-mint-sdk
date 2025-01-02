/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { BigNumber } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'
import { Wallet } from '@ethersproject/wallet'

const LIDO = '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84'

export async function addLiquidityToLido(amount: BigNumber, signer: Wallet) {
  const contract = new Contract(LIDO, LIDO_ABI, signer)
  const gasEstimate = await contract.estimateGas.submit(
    '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B',
    { value: amount }
  )
  await contract.submit('0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B', {
    gasLimit: gasEstimate,
    value: amount,
  })
}

const LIDO_ABI = [
  {
    constant: false,
    inputs: [{ name: '_referral', type: 'address' }],
    name: 'submit',
    outputs: [{ name: '', type: 'uint256' }],
    payable: true,
    stateMutability: 'payable',
    type: 'function',
  },
]
