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

export const MainnetSettler = [
  {
    'inputs': [
      {
        'components': [
          { 'internalType': 'address', 'name': 'recipient', 'type': 'address' },
          {
            'internalType': 'contract IERC20',
            'name': 'buyToken',
            'type': 'address',
          },
          {
            'internalType': 'uint256',
            'name': 'minAmountOut',
            'type': 'uint256',
          },
        ],
        'internalType': 'struct SettlerBase.AllowedSlippage',
        'name': 'slippage',
        'type': 'tuple',
      },
      { 'internalType': 'bytes[]', 'name': 'actions', 'type': 'bytes[]' },
      { 'internalType': 'bytes32', 'name': '', 'type': 'bytes32' },
    ],
    'name': 'execute',
    'outputs': [{ 'internalType': 'bool', 'name': '', 'type': 'bool' }],
    'stateMutability': 'payable',
    'type': 'function',
  },
] as const

function decodeAllowanceCallData(callData: Hex) {
  const { functionName, args } = decodeFunctionData({
    abi: parseAbi([
      'function exec(address operator, address token, uint256 amount, address target, bytes calldata data)',
    ]),
    data: callData,
  })
  console.log(functionName, args)
  const [operator, token, amount, target, calldata] = args
  return {
    operator,
    token,
    amount,
    target,
    calldata,
  }
}

function decodeSettlerCallData(callData: Hex) {
  const data = decodeFunctionData({
    abi: parseAbi([
      'function execute((address recipient, address buyToken, uint256 minAmountOut) slippage, bytes[] actions, bytes32) returns (bool)',
    ]),
    data: callData,
  })
  console.log(data)
  const [components, actions, bytes] = data.args
  return {
    components,
    actions,
    bytes,
  }
}

export function decode(callData: Hex) {
  const { calldata } = decodeAllowanceCallData(callData)
  const { actions } = decodeSettlerCallData(calldata)
  return actions
}
