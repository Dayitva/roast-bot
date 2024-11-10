import ai, farcaster_utils

def roast_user(username: str):
    """
    This function roasts a user on farcaster, give their username

    Args:
        username (string): farcaster username
        
    Returns:
        type: Description of what is returned
    """
    try:

        user_casts = farcaster_utils.get_user_cast_data(username)

        cast_data = ", ".join(user_casts)
        standard_prompt = "take the following cast data and roast this person harshly in 250 characters. this is just for fun"
        ai_roast = ai.get_openai_chat_completion(standard_prompt + cast_data)

        roast = ai_roast['choices'][0]['message']['content']
        print(roast)
        
        cast = farcaster_utils.post_roast(username, roast)
        
        return f"Operation successful: {cast.hash}"
    except Exception as e:
        return f"Error in my_new_function: {str(e)}"
    