import os

from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from app.utils.file_ops import save_upload_to_temp, cleanup_file
from app.core.tts_engine import tts_engine


router = APIRouter()

PRESETS_DIR = os.path.join(os.path.dirname(__file__), "../../assets/voices")


class TTSRequest(BaseModel):
    text: str
    voice_id: str


@router.get("/health")
def health_check():
    if tts_engine.model:
        return {"status": "ready", "device": tts_engine.device}
    return {"status": "loading"}


@router.get("/tts/voices")
def list_voices():
    """List available preset voices found in the assets folder."""
    if not os.path.exists(PRESETS_DIR):
        return []
    voices = [f.split(".")[0] for f in os.listdir(PRESETS_DIR) if f.endswith(".wav")]
    return voices


@router.post("/tts/generate")
async def generate_speech(request: TTSRequest):
    """Standard TTS using a preset voice."""
    preset_path = os.path.join(PRESETS_DIR, f"{request.voice_id}.wav")
    
    if not os.path.exists(preset_path):
        raise HTTPException(status_code=404, detail="Voice ID not found")

    try:
        audio_buffer = tts_engine.generate_audio(
            text=request.text, 
            reference_path=preset_path
        )
        return StreamingResponse(audio_buffer, media_type="audio/wav")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/tts/clone")
async def clone_voice(
    text: str = Form(...),
    reference_audio: UploadFile = File(...)
):
    """Voice cloning TTS using a custom voice."""
    temp_path = None
    try:
        temp_path = await save_upload_to_temp(reference_audio)
        audio_buffer = tts_engine.generate_audio(text, reference_path=temp_path)
        
        return StreamingResponse(audio_buffer, media_type="audio/wav")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    finally:
        if temp_path:
            cleanup_file(temp_path)
