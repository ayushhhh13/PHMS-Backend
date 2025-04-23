import json
import random
from get_completion import get_completion
from prompts.therapist_prompt import SYSTEM_PROMPT

def add_empathy_intro(prompt):
    starters = [
        "Thanks for sharing that with me.",
        "You’ve taken a strong step by opening up.",
        "What you're feeling is completely valid.",
        "I'm really here with you right now.",
        "You’re not alone in this — let’s figure it out together."
    ]
    return f"{random.choice(starters)}\n\n{prompt}"

def get_answer(conversation_history):
    history_json = json.dumps(conversation_history, indent=2)
    latest_input = conversation_history[-1]["content"] if conversation_history else "Hello"

    base_prompt = SYSTEM_PROMPT.replace("{latest_input}", latest_input).replace("{conversation_history}", history_json)
    final_prompt = add_empathy_intro(base_prompt)

    response = get_completion(final_prompt, engine="gpt-4o-aispeaking")
    response_dict = json.loads(response)
    return response_dict.get("llm_response", "") 

 