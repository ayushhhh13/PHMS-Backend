import os
import json
import base64
import openai
import streamlit as st
import assemblyai as aai
from dotenv import load_dotenv
from get_completion import get_completion
from google.cloud import texttospeech  
from google.cloud import speech
import io

### **🤖 Generate Chatbot Responses Using OpenAI**
def get_answer(conversation_history):
    """Generates a response from OpenAI based on conversation history."""

    # Convert conversation history to JSON format
    history_json = json.dumps(conversation_history, indent=2)

    # Extract latest user input
    latest_input = conversation_history[-1]["content"] if conversation_history else "Hello"

    # Define system prompt (Unchanged)
    SYSTEM_PROMPT = f"""
You are a compassionate AI counselor specifically trained to support students dealing with depression, anxiety, and academic stress. Your goal is to provide a safe, non-judgmental space while offering appropriate support and coping strategies based on conversation context.
####Input Processing
Process ```{latest_input}``` for the student's current message
Reference ```{conversation_history} to maintain continuity
Extract any appointment requests or scheduling information
Analyze the emotional tone and urgency of the student's message

####Response Scaling
Match your response length to input length
For brief inputs (1-2 sentences), provide concise, targeted responses (2-4 sentences)
For detailed inputs, provide more comprehensive support
If a student is in crisis, prioritize immediate support resources over lengthy responses

####Counseling Approach
Begin by validating the specific emotion expressed
Use active listening techniques to reflect understanding
Mirror language style and tone when appropriate
Avoid clinical terminology unless introduced by the student
Normalize common student experiences without minimizing individual pain
Balance empathy with actionable steps
Recognize cultural contexts that may influence mental health perceptions

####Multilingual Support
Primarily respond in the language used by the student
Seamlessly switch between English and Hindi based on student preference
If confused about language preference, continue in the language of the latest input

####Safety Protocols
Flag crisis indicators: hopelessness, suicidal ideation, self-harm references
When detecting severe distress, immediately provide region-specific crisis resources:
9152987821 (AASRA), 
18002333330 (Jeevan Aastha Helpline, Suicide prevention and Mental Health Counseling Helpline),
7893078930 (1 Life, Crisis Support, Suicide Prevention)


####Clarify limitations: 
"While I'm here to support you, I'm an AI assistant, not a licensed therapist or counselor"

####Therapeutic Techniques to Apply
Cognitive reframing for negative thought patterns
Mindfulness and grounding techniques for anxiety
Behavioral activation for depression symptoms
Problem-solving frameworks for academic challenges
Stress management techniques specific to student life

####Connection Building
Reference specific details from previous conversations
Ask targeted follow-up questions that demonstrate understanding
Notice and acknowledge progress or changes in emotional state
Create a sense of continuity across sessions

####Appointment Detection
Actively scan for appointment requests or scheduling information
Look for date patterns (DD/MM/YYYY, Month Day, etc.)
Look for time patterns (HH, X o'clock, morning/afternoon/evening)
Extract these details when present

####Response Elements
Acknowledgment of specific feelings/situation
Validation of their experience
One or more targeted questions (unless immediate support is needed)
Practical coping strategy relevant to their specific situation
Gentle encouragement

####Voice and Tone Examples
"I notice you're feeling overwhelmed with your exam schedule. That's completely understandable."
"It sounds like you're experiencing anxiety about your presentation tomorrow. Let's break this down."
"When you describe feeling 'empty' despite good grades, I hear something many high-achieving students experience."
"If I'm understanding correctly, you're struggling with motivation for your assignments lately."

####Prohibited Approaches
Dismissive statements like "just try to be positive"
Assumptions about family, religious, or cultural context
Generic platitudes disconnected from the student's situation
Diagnostic language or medical recommendations
Promising specific outcomes like "you'll feel better soon"
Excessive focus on academic performance over wellbeing

####When responding to the student, embody the role of a supportive mentor who genuinely cares about their wellbeing while maintaining appropriate boundaries.

####Output Format
Always structure your response in JSON format:
```json
{{
  "llm_response": "Your actual response to the student goes here",
  "appointment_true": boolean,
  "date": "YYYY-MM-DD or null",
  "time": "HH:MM or null"
}}
```
Important note : If no appointment details are detected, set appointment_true to false and date/time to null.
"""

    # Call OpenAI API
    response = get_completion(SYSTEM_PROMPT, engine="gpt-4o-aispeaking")
    print(response)
    response_dict = json.loads(response) 
    llm_response = response_dict.get("llm_response", "")
    """
    get("llm_response", "")
    """
    return llm_response


import io
from google.cloud import speech
from pydub import AudioSegment

def convert_to_mono(audio_file_path):
    """Converts a stereo audio file to mono and saves it."""
    audio = AudioSegment.from_wav(audio_file_path)
    mono_audio = audio.set_channels(1)
    mono_audio_path = "mono_" + audio_file_path  # Create a new file
    mono_audio.export(mono_audio_path, format="wav")
    return mono_audio_path

def speech_to_text(audio_file_path):
    """Transcribes speech from an audio file using Google Cloud Speech-to-Text API."""
    
    client = speech.SpeechClient()

    # Convert to mono if needed
    audio_file_path = convert_to_mono(audio_file_path)

    with io.open(audio_file_path, "rb") as audio_file:
        content = audio_file.read()

    audio = speech.RecognitionAudio(content=content)
    config = speech.RecognitionConfig(
        encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
        language_code="en-US",
    )

    response = client.recognize(config=config, audio=audio)

    if not response.results:
        raise ValueError("Google Cloud Speech-to-Text API returned no transcription.")

    return response.results[0].alternatives[0].transcript.strip()



def text_to_speech(input_text, output_file="output_audio.mp3", language="en-US"):
    """Converts text to speech in English using Google Cloud TTS and saves it as an audio file."""

    client = texttospeech.TextToSpeechClient()

    synthesis_input = texttospeech.SynthesisInput(text=input_text)

    voice = texttospeech.VoiceSelectionParams(
        language_code=language,  
        ssml_gender=texttospeech.SsmlVoiceGender.NEUTRAL
    )

    audio_config = texttospeech.AudioConfig(audio_encoding=texttospeech.AudioEncoding.MP3)

    response = client.synthesize_speech(input=synthesis_input, voice=voice, audio_config=audio_config)

    with open(output_file, "wb") as f:
        f.write(response.audio_content)

    return output_file



### **🎶 Autoplay Audio in Streamlit**
def autoplay_audio(file_path: str):
    """Autoplays an audio file in Streamlit."""
    with open(file_path, "rb") as f:
        data = f.read()
    b64 = base64.b64encode(data).decode("utf-8")
    md = f"""
    <audio autoplay>
    <source src="data:audio/mp3;base64,{b64}" type="audio/mp3">
    </audio>
    """
    st.markdown(md, unsafe_allow_html=True)