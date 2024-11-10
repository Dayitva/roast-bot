import os
from web3 import Web3
# from web3.middleware import geth_poa_middleware

# Set up web3 connection
provider_url = "https://base-sepolia-rpc.publicnode.com."
web3 = Web3(Web3.HTTPProvider(provider_url))
# assert w3.is_connected(), "Not connected to a Celo node"

# # Add PoA middleware to web3.py instance
# w3.middleware_onion.inject(geth_poa_middleware, layer=0)

abi = [
    {
        "inputs": [
            {
                "internalType": "contract ISuperToken",
                "name": "token",
                "type": "address"
            },
            { "internalType": "address", "name": "sender", "type": "address" },
            { "internalType": "address", "name": "receiver", "type": "address" },
            { "internalType": "bytes", "name": "userData", "type": "bytes" }
        ],
        "name": "deleteFlow",
        "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
        "stateMutability": "nonpayable",
        "type": "function"
    }
]

#senderAddress = Web3.to_checksum_address("0x631088Af5A770Bee50FFA7dd5DC18994616DC1fF")
senderAddress = Web3.to_checksum_address("0x23B125467AE38C20dAE8A2B52D3019a06A48105c")
contract_address = Web3.to_checksum_address("0xcfA132E353cB4E398080B9700609bb008eceB125")
superTokenAddress = Web3.to_checksum_address("0x143ea239159155b408e71cdbe836e8cfd6766732")
private_key = ""
account = web3.eth.account.from_key(private_key)

contract = web3.eth.contract(address=contract_address, abi=abi)

nonce = web3.eth.get_transaction_count(account.address)
txn = contract.functions.deleteFlow(superTokenAddress, senderAddress, account.address, "0x").build_transaction({
    'from': account.address,
    'gas': 2000000,
    'gasPrice': web3.eth.gas_price,
    'nonce': nonce
})

signed_txn = web3.eth.account.sign_transaction(txn, private_key)
txn_hash = web3.eth.send_raw_transaction(signed_txn.raw_transaction)
txn_receipt = web3.eth.wait_for_transaction_receipt(txn_hash)
print(txn_receipt)

