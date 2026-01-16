const API_URL = "http://localhost:8000";

export const fetchVoices = async (): Promise<string[]> => {
  try {
    const response = await fetch(`${API_URL}/tts/voices`);

    if (!response.ok) throw new Error("Failed to fetch voices");
    const data = await response.json();
    
    if (Array.isArray(data)) {
      return data;
    }
    return data.voices || [];
    
  } catch (error) {
    console.error("Error fetching voices:", error);
    return [];
  }
};

export const generatePresetAudio = async (text: string, voiceId: string) => {
  const res = await fetch(`${API_URL}/tts/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, voice_id: voiceId }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Generation failed");
  }
  
  const blob = await res.blob();
  return URL.createObjectURL(blob);
};

export const cloneVoiceAudio = async (file: File, text: string): Promise<string | null> => {
  try {
    const formData = new FormData();
    formData.append("reference_audio", file);
    formData.append("text", text);

    const response = await fetch(`${API_URL}/tts/clone`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Failed to clone voice");

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Error cloning voice:", error);
    return null;
  }
};
