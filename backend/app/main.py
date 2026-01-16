from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from contextlib import asynccontextmanager
from app.core.tts_engine import tts_engine
from app.api.routes import router


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Initializing Application...")
    tts_engine.load_model()
    yield
    print("Shutting down...")

app = FastAPI(title="Chatterbox API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=False)
