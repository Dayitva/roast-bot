from web3 import Web3
import agent, time
import db, farcaster_utils
import config

current_roasted_user = "0xfran"
roast_active = True

provider_url = "https://base-sepolia-rpc.publicnode.com."
web3 = Web3(Web3.HTTPProvider(provider_url))

super_token_address = Web3.to_checksum_address("0x143ea239159155b408e71cdbe836e8cfd6766732")
bot_address = Web3.to_checksum_address("0x327470ee862e4778c9d3864f89a3eec87bbdd1dd")

roasted_user_address = farcaster_utils.get_user_address_by_username(current_roasted_user)
roasted_user_address = Web3.to_checksum_address(roasted_user_address)

if web3.is_connected():
    print("Connected to Ethereum network")
else:
    print("Failed to connect to Ethereum network")

contract_address = "0xcfA132E353cB4E398080B9700609bb008eceB125"

flow_rate_abi = [
      {
    "inputs": [
      {
        "internalType": "contract ISuperToken",
        "name": "token",
        "type": "address"
      },
      { "internalType": "address", "name": "sender", "type": "address" },
      { "internalType": "address", "name": "receiver", "type": "address" }
    ],
    "name": "getFlowrate",
    "outputs": [
      { "internalType": "int96", "name": "flowrate", "type": "int96" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
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

super_contract = web3.eth.contract(address=contract_address, abi=flow_rate_abi)

def get_onchain_flow_rate():
    try:
        current_flow_rate = super_contract.functions.getFlowrate(f'{super_token_address}',f'{roasted_user_address}',f'{bot_address}').call()
        #print("Function call result:", current_flow_rate)
    except Exception as e:
        print("Error calling function:", e)

    return current_flow_rate


def delete_flow():
    private_key = config.PRIVATE_KEY
    nonce = web3.eth.get_transaction_count(bot_address)
    txn = super_contract.functions.deleteFlow(f'{super_token_address}', f'{roasted_user_address}',f'{bot_address}', "0x").build_transaction({
    'from': bot_address,
    'gas': 2000000,
    'gasPrice': web3.eth.gas_price,
    'nonce': nonce
})
    
    signed_txn = web3.eth.account.sign_transaction(txn, private_key)
    txn_hash = web3.eth.send_raw_transaction(signed_txn.raw_transaction)
    txn_receipt = web3.eth.wait_for_transaction_receipt(txn_hash)
    print(txn_receipt)



# def roast_user_continuously(username):
#     while True:
#         agent.roast_user(username)
#         time.sleep(300)

def roast_users():
    global current_roasted_user, roast_active

    while roast_active:
        print(f'currently roasting: {current_roasted_user}') 
        db_flow_rate = db.read_roast_data(1)
        onchain_flow_rate = get_onchain_flow_rate()  

        print(db.read_roast_data(1))

        if onchain_flow_rate !=  db_flow_rate['flowrate']: 
            print('switch to roast new user')
            next_user_to_roast = db.read_roast_data(1)['roastee']
            
            print(f'switching to roast: {next_user_to_roast}')
            
            # delete the stream
            
            current_roasted_user = next_user_to_roast
            agent.roast_user(current_roasted_user)

        else:
            print('roasting same user')
            agent.roast_user(current_roasted_user)

        time.sleep(10)
            

