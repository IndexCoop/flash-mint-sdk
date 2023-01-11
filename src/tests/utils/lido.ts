import { BigNumber } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'
import { Wallet } from '@ethersproject/wallet'

import { stETH, wstETH } from 'constants/tokens'

import { approveErc20 } from '.'

const LIDO = '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84'

const stEthAddress = stETH.address!
const wsthEthAddress = wstETH.address!

export async function addLiquidityToLido(amount: BigNumber, signer: Wallet) {
  const contract = new Contract(LIDO, LIDO_ABI, signer)
  await contract.submit('0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B', {
    gasLimit: 100_000,
    value: amount,
  })
}

export async function wrapStEth(amount: BigNumber, signer: Wallet) {
  await approveErc20(stEthAddress, wsthEthAddress, amount, signer)
  const contract = new Contract(wsthEthAddress, WSTETH_ABI, signer)
  await contract.wrap(amount, { gasLimit: 120_000 })
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

const WSTETH_ABI = [
  {
    inputs: [
      { internalType: 'uint256', name: '_stETHAmount', type: 'uint256' },
    ],
    name: 'wrap',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
]
