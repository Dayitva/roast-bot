export const cfa_abi = [
    {
        inputs: [
            { internalType: "contract ISuperToken", name: "token", type: "address" },
            { internalType: "address", name: "receiver", type: "address" },
            { internalType: "int96", name: "flowrate", type: "int96" }
        ],
        name: 'setFlowrate',
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: 'nonpayable',
        type: 'function',
    },
] as const

export const iseth_abi = [
    {
		inputs: [],
		name: "upgradeByETH",
		outputs: [],
		stateMutability: "payable",
		type: "function"
	},
] as const

