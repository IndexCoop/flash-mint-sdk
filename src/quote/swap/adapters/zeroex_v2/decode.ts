import { SettlerActionsABI } from 'quote/swap/adapters/zeroex_v2/abis/SettlerActions'
import { SignatureTransferABI } from 'quote/swap/adapters/zeroex_v2/abis/SignatureTransfer'
import { type Hex, decodeFunctionData, parseAbi } from 'viem'

export const IEIP712_ABI = [
  {
    inputs: [],
    name: 'DOMAIN_SEPARATOR',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export function decode(callData: string) {
  const { functionName, args } = decodeFunctionData({
    abi: parseAbi([
      'function exec(address operator, address token, uint256 amount, address target, bytes calldata data)',
    ]),
    data: callData as Hex,
  })
  console.log(functionName, args)
  const [operator, token, amount, target, transformations] = args
  const data = decodeFunctionData({
    abi: SettlerActionsABI,
    data: transformations as Hex,
  })
  console.log(data)
}
