import { viem } from 'hardhat'
export { wei } from 'utils/numbers'
import type { Signer } from '@ethersproject/abstract-signer'
import { BigNumber } from '@ethersproject/bignumber'
import type { JsonRpcProvider } from '@ethersproject/providers'
import { getContract, parseAbi } from 'viem'
import type { Address } from 'viem'

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

export async function approveErc20(
  erc20Address: string,
  spender: string,
  amount: BigNumber,
  owner: string,
) {
  const publicClient = await viem.getPublicClient()
  const walletClient = await viem.getWalletClient(owner)
  const txHash = await walletClient.writeContract({
    address: erc20Address,
    abi: parseAbi(abi),
    functionName: 'approve',
    args: [spender, amount],
  })
  await publicClient.waitForTransactionReceipt({ hash: txHash })
}

export async function allowanceOf(
  erc20Address: string,
  spender: string,
  signer: Signer,
): Promise<BigNumber> {
  const publicClient = await viem.getPublicClient()
  const bn = await publicClient.readContract({
    address: erc20Address as Address,
    functionName: 'allowance',
    args: [await signer.getAddress(), spender],
    abi: parseAbi(abi),
  })
  return BigNumber.from((bn as unknown as bigint).toString())
}

export async function balanceOf(
  signer: string,
  erc20Address: string,
): Promise<BigNumber> {
  const publicClient = await viem.getPublicClient()
  const bn = await publicClient.readContract({
    address: erc20Address as Address,
    abi: parseAbi(abi),
    functionName: 'balanceOf',
    args: [signer],
  })
  return BigNumber.from((bn as unknown as bigint).toString())
}

export async function transferFromWhale(
  whale: string,
  to: string,
  amount: BigNumber,
  erc20Address: string,
  provider: JsonRpcProvider,
) {
  // 1. Get your in-memory clients
  const publicClient = await viem.getPublicClient() // read-only RPC :contentReference[oaicite:0]{index=0}
  const testClient = await viem.getTestClient() // evm test methods :contentReference[oaicite:1]{index=1}
  const walletClient = await viem.getWalletClient({
    // signer for any address
    address: whale,
  }) // :contentReference[oaicite:2]{index=2}

  // 2. Impersonate the whale
  await testClient.impersonateAccount({ address: whale }) // :contentReference[oaicite:3]{index=3}

  // 3. Bind an ERC20 contract instance to those clients
  const token = getContract({
    address: erc20Address as Address,
    abi: parseAbi(abi),
    client: { public: publicClient, wallet: walletClient },
  }) // :contentReference[oaicite:4]{index=4}

  // 4. Check the whale’s balance
  const balance = await token.read.balanceOf([whale])
  if (balance < amount) {
    throw new Error(
      `Not enough balance to steal ${amount} of ${erc20Address} from ${whale}: have ${balance}`,
    )
  }

  // 5. Send the transfer
  const txHash = await token.write.transfer([to, amount], {
    account: whale,
    gas: 100_000n,
  })

  // 6. Wait for confirmation (so the token shows up in `to`)
  await publicClient.waitForTransactionReceipt({ hash: txHash })

  // 7. Stop impersonating
  await testClient.stopImpersonatingAccount({ address: whale }) // :contentReference[oaicite:5]{index=5}
}
