import { BigNumber } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'
import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers'
import { Wallet } from '@ethersproject/wallet'

export { wei } from 'utils/numbers'

export function createERC20Contract(
  erc20Address: string,
  providerOrSigner: JsonRpcProvider | JsonRpcSigner | Wallet
): Contract {
  const abi = [
    // Read-Only Functions
    'function allowance(address account, address spender) external view returns (uint)',
    'function balanceOf(address owner) view returns (uint256)',
    'function decimals() view returns (uint8)',
    'function symbol() view returns (string)',
    // Authenticated Functions
    'function approve(address spender, uint rawAmount) external returns (bool)',
    'function transfer(address to, uint amount) returns (bool)',
  ]
  return new Contract(erc20Address, abi, providerOrSigner)
}

export async function approveErc20(
  erc20Address: string,
  spender: string,
  amount: BigNumber,
  signer: Wallet
) {
  const contract = createERC20Contract(erc20Address, signer)
  const approveTx = await contract.approve(spender, amount, {
    gasLimit: 100_000,
  })
  await approveTx.wait()
}

export async function allowanceOf(
  erc20Address: string,
  spender: string,
  signer: Wallet
): Promise<BigNumber> {
  const contract = createERC20Contract(erc20Address, signer)
  return await contract.allowance(signer.address, spender)
}

export async function balanceOf(
  signer: Wallet,
  erc20Address: string
): Promise<BigNumber> {
  const contract = createERC20Contract(erc20Address, signer)
  return await contract.balanceOf(signer.address)
}

export async function transferFromWhale(
  whale: string,
  to: string,
  amount: BigNumber,
  erc20Address: string,
  provider: JsonRpcProvider
) {
  const signer = await provider.getSigner(whale)
  const contract = createERC20Contract(erc20Address, signer)
  const balance = await contract.balanceOf(whale)
  if (balance.lt(amount)) {
    throw new Error(
      `Not enough balance to steal ${amount} ${erc20Address} from ${whale}: ${balance}`
    )
  }
  await provider.send('hardhat_impersonateAccount', [whale])
  const transferTx = await contract.transfer(to, amount, {
    gasLimit: 100_000,
  })
  await transferTx.wait()
  await provider.send('hardhat_stopImpersonatingAccount', [whale])
}
