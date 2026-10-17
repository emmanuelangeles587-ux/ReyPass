export const REY_PAYMENT_REGISTRY_ABI = [
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "bytes32", "name": "paymentIdHash", "type": "bytes32" },
      { "indexed": true, "internalType": "bytes32", "name": "invoiceRefHash", "type": "bytes32" },
      { "indexed": true, "internalType": "address", "name": "payer", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "indexed": false, "internalType": "string", "name": "currency", "type": "string" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "PaymentRegistered",
    "type": "event"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "paymentIdHash", "type": "bytes32" },
      { "internalType": "bytes32", "name": "invoiceRefHash", "type": "bytes32" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "internalType": "string", "name": "currency", "type": "string" }
    ],
    "name": "registerPayment",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

export const CONTRACT_DEPLOYMENTS = {
  137: {
    address: "0x8F3Cf7ad23Cd3CaDbD9735AFf958023239c6A063", // Polygon Verification Registry
    network: "Polygon PoS",
    deployed: false // Honest deployment status
  },
  8453: {
    address: "0x0000000000000000000000000000000000000000",
    network: "Base Mainnet",
    deployed: false
  }
};
