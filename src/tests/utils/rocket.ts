import { BigNumber } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'
import { Wallet } from '@ethersproject/wallet'

const ROCKET_DEPOSIT_POOL = '0x2cac916b2A963Bf162f076C0a8a4a8200BCFBfb4'

export async function depositIntoRocketPool(amount: BigNumber, signer: Wallet) {
  const contract = new Contract(
    ROCKET_DEPOSIT_POOL,
    ROCKET_DEPOSIT_POOL_ABI,
    signer
  )
  await contract.deposit({ gasLimit: 220_000, value: amount })
}

const ROCKET_DEPOSIT_POOL_ABI = [
  {
    inputs: [],
    name: 'deposit',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
]
