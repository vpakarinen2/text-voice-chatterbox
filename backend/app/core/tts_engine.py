import torchaudio
import logging
import torch
import io

from chatterbox.tts_turbo import ChatterboxTurboTTS


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class TTSEngine:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(TTSEngine, cls).__new__(cls)
            cls._instance.model = None
            cls._instance.device = "cuda" if torch.cuda.is_available() else "cpu"
        return cls._instance

    def load_model(self):
        """Loads the Chatterbox model into memory."""
        if self.model is None:
            logger.info(f"Loading Chatterbox Turbo on {self.device}...")
            try:
                self.model = ChatterboxTurboTTS.from_pretrained(device=self.device)
                logger.info("Model loaded successfully.")
            except Exception as e:
                logger.error(f"Failed to load model: {e}")
                raise e

    def generate_audio(self, text: str, reference_path: str = None) -> io.BytesIO:
        if not self.model:
            raise RuntimeError("Model is not loaded.")

        try:
            logger.info(f"Generating TTS for: {text[:30]}...")
            
            if reference_path:
                wav = self.model.generate(text, audio_prompt_path=reference_path)
            else:
                raise ValueError("Reference audio path is required for Chatterbox cloning.")

            buffer = io.BytesIO()
            torchaudio.save(buffer, wav.cpu(), self.model.sr, format="wav")
            buffer.seek(0)

            return buffer
        except Exception as e:
            logger.error(f"Inference error: {e}")
            raise e

tts_engine = TTSEngine()
