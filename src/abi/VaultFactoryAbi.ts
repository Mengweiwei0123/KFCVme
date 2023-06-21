export const VaultFactoryAbi = [
  { type: 'constructor', stateMutability: 'nonpayable', inputs: [] },
  {
    type: 'event',
    name: 'CreateBluemsunVault',
    inputs: [
      { type: 'uint256', name: 'key', internalType: 'uint256', indexed: true },
      { type: 'address', name: 'devault', internalType: 'address', indexed: true },
    ],
    anonymous: false,
  },
  {
    type: 'function',
    stateMutability: 'nonpayable',
    outputs: [{ type: 'address', name: '', internalType: 'contract BluemsunVault' }],
    name: 'createBluemsunVault',
    inputs: [
      { type: 'uint256', name: 'keyHash', internalType: 'uint256' },
      { type: 'uint256', name: 'passwordHash', internalType: 'uint256' },
    ],
  },
  {
    type: 'function',
    stateMutability: 'view',
    outputs: [{ type: 'address', name: '', internalType: 'contract BluemsunVault' }],
    name: 'getBluemsunVault',
    inputs: [{ type: 'uint256', name: 'keyHash', internalType: 'uint256' }],
  },
];
