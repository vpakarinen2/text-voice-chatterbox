import shutil
import uuid
import os

from fastapi import UploadFile


TEMP_DIR = "temp_audio"
os.makedirs(TEMP_DIR, exist_ok=True)


async def save_upload_to_temp(file: UploadFile) -> str:
    """Saves uploaded file to a temp directory."""
    file_ext = file.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{file_ext}"
    file_path = os.path.join(TEMP_DIR, filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    return file_path


def cleanup_file(file_path: str):
    """Deletes the temporary file."""
    if os.path.exists(file_path):
        try:
            os.remove(file_path)
        except Exception:
            pass
