import io
from google.cloud import speech
from .audio_utils import convert_to_mono

def speech_to_text(audio_file_path):
    client = speech.SpeechClient()
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