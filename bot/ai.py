import os, config
import requests
import farcaster_utils


def get_openai_chat_completion(prompt, temperature=0.7):
    url = "https://api.openai.com/v1/chat/completions"
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {config.OPENAPI_KEY}"
    }
    
    data = {
        "model": "gpt-4o-mini",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": temperature
    }
    
    response = requests.post(url, headers=headers, json=data)
    
    if response.status_code == 200:
        return response.json()  
    else:
        response.raise_for_status() 
    return response


# fid = farcaster_utils.get_fid_by_username('femi-adebimpe')

# user_casts = farcaster_utils.get_user_cast_data(fid)

# cast_data = ", ".join(user_casts)

# standard_prompt = "take the following cast data and roast this person mildly in 250 characters of less"

# ai_response = get_openai_chat_completion(standard_prompt + cast_data)

# print(ai_response)
