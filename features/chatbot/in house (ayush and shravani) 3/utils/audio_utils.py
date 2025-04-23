from pydub import AudioSegment

def convert_to_mono(audio_file_path):
    audio = AudioSegment.from_wav(audio_file_path)
    mono_audio = audio.set_channels(1)
    mono_audio_path = "mono_" + audio_file_path
    mono_audio.export(mono_audio_path, format="wav")
    return mono_audio_path