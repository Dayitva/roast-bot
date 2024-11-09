import config
from farcaster import Warpcast

client = Warpcast(mnemonic=config.MNEMONIC)

def get_roast_bot_address():
    return client.get_custody_address('roast-bot')
    
def get_user_address_by_username(username):
    result = client.get_custody_address(username)
    return result.custody_address

def post_roast(username, roast, frame):
    response = client.post_cast(text=f'${roast} @{username}, {frame}')
    return response

def get_fid_by_username(username):
    user_data = client.get_user_by_username(username)
    fid = 0
    for data in user_data:
        if data[0] == 'fid':
            fid = data[1]
        return fid
    
def get_user_cast_data(username):
    fid = get_fid_by_username(username)
    user_casts = client.get_casts(fid)
    
    cast_data = []

    for casts in user_casts.casts:
        for cast in casts:
            if cast[0] == 'text':
                cast_data.append(cast[1])

    return cast_data


# fid = get_fid_by_username('femi-adebimpe')
# user_casts = get_user_cast_data('femi-adebimpe')
# print(user_casts)

# get mention and reply notifications

# get user 

# get user by username 

# get custody address

# get casts 

# post casts (includes embeds)

# get user cast likes (data for roasting)

# get wallet (given mnemonic)
