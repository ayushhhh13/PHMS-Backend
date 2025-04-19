from fastapi import FastAPI, UploadFile, File, HTTPException
import json
import os
import io
import base64
from google.cloud import texttospeech, speech
from pydub import AudioSegment

def get_completion(prompt, engine="gpt-4o-aispeaking"):
    messages = [{"role": "user", "content": prompt}]

    response = openai.ChatCompletion.create(
            engine=engine,
            messages=messages,
            temperature=0.0
        )

    content = response.choices[0].message["content"]

    if content.startswith("```json") and content.endswith("```"):
        content = content[7:-3].strip()

    return content

app = FastAPI()

@app.post("/get_answer/")
async def get_answer(conversation_history: list):
    """Generates a chatbot response based on conversation history."""
    try:
        latest_input = conversation_history[-1]["content"] if conversation_history else "Hello"
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
        
        response = get_completion(SYSTEM_PROMPT, engine="gpt-4o-aispeaking")
        response_dict = json.loads(response)
        return response_dict
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/speech_to_text/")
async def speech_to_text(audio_file: UploadFile = File(...)):
    """Converts speech to text using Google Cloud Speech-to-Text API."""
    try:
        contents = await audio_file.read()
        temp_audio_path = "temp_audio.wav"
        
        with open(temp_audio_path, "wb") as f:
            f.write(contents)
        
        audio = AudioSegment.from_file(temp_audio_path)
        audio = audio.set_channels(1).set_frame_rate(16000)
        audio.export(temp_audio_path, format="wav")
        
        client = speech.SpeechClient()
        with io.open(temp_audio_path, "rb") as audio_file:
            content = audio_file.read()
        
        audio = speech.RecognitionAudio(content=content)
        config = speech.RecognitionConfig(
            encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
            language_code="en-US",
            enable_automatic_punctuation=True,
            model="default",
            sample_rate_hertz=16000
        )
        
        response = client.recognize(config=config, audio=audio)
        os.remove(temp_audio_path)
        
        if not response.results:
            raise HTTPException(status_code=400, detail="No speech detected.")
        
        transcript = response.results[0].alternatives[0].transcript.strip()
        return {"transcript": transcript}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/text_to_speech/")
async def text_to_speech(input_text: str):
    """Converts text to speech using Google Cloud Text-to-Speech API."""
    try:
        client = texttospeech.TextToSpeechClient()
        synthesis_input = texttospeech.SynthesisInput(text=input_text)
        
        voice = texttospeech.VoiceSelectionParams(
            language_code="en-US",
            ssml_gender=texttospeech.SsmlVoiceGender.NEUTRAL
        )
        
        audio_config = texttospeech.AudioConfig(audio_encoding=texttospeech.AudioEncoding.MP3)
        response = client.synthesize_speech(input=synthesis_input, voice=voice, audio_config=audio_config)
        
        audio_base64 = base64.b64encode(response.audio_content).decode("utf-8")
        return {"audio_base64": audio_base64}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))