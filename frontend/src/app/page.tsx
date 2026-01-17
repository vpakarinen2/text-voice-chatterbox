"use client";

import { useState, useEffect, useRef } from "react";

import { Play, Pause, Upload, Download, Loader2, Volume2, RefreshCcw } from "lucide-react";
import { fetchVoices, generatePresetAudio, cloneVoiceAudio } from "@/services/api";

export default function Home() {
  const [text, setText] = useState("Hello! This is a test for the chatterbox text to speech model.");

  const [activeTab, setActiveTab] = useState<"preset" | "clone">("preset");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);

  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [cloneFile, setCloneFile] = useState<File | null>(null);
  const [loadingVoices, setLoadingVoices] = useState(true);
  const [voices, setVoices] = useState<string[]>([]);

  useEffect(() => {
    loadVoices();
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
  }, [audioUrl]);

  const loadVoices = () => {
    setLoadingVoices(true);
    fetchVoices()
      .then((data: string[]) => {
        setVoices(data);
        if (data.length > 0) setSelectedVoice(data[0]);
      })
      .catch((err) => {
        console.error("Failed to load voices:", err);
      })
      .finally(() => {
        setLoadingVoices(false);
      });
  };

  const togglePlay = () => {
    if (!audioUrl) return;

    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => setIsPlaying(false);
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleGenerate = async () => {
    if (!text.trim()) return alert("Please enter some text");

    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }

    setLoading(true);
    setAudioUrl(null);

    try {
      let url: string | null = null;
      if (activeTab === "preset") {
        if (!selectedVoice) return alert("Please select a voice");
        url = await generatePresetAudio(text, selectedVoice);
      } else {
        if (!cloneFile) return alert("Please upload a voice sample");
        url = await cloneVoiceAudio(cloneFile, text);
      }

      if (url) {
        setAudioUrl(url);
      } else {
        alert("Failed to generate audio");
      }
    } catch (error) {
      console.error(error);
      alert("Error generating audio");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-300 flex items-center justify-center p-4">
      
      {/* CARD: Bright White (bg-white) for high contrast */}
      <div className="w-full max-w-4xl bg-blue-50 rounded-3xl overflow-hidden border">
        
        {/* HEADER: Light mode text */}
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gray-500 rounded-xl">
              <Volume2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-600 tracking-tight">Chatterbox</h1>
              <p className="text-slate-500 text-sm font-md">TTS/Voice Cloning</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold font-mono text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            ONLINE
          </div>
        </div>

        <div className="p-8 space-y-6">
          
          {/* TABS: Light gray background */}
          <div className="grid grid-cols-2 gap-1 p-1.5 bg-gray-200 rounded-xl border border-gray-300">
            <button
              onClick={() => setActiveTab("preset")}
              className={`py-2.5 px-4 rounded-lg text-sm font-bold transition-all ${
                activeTab === "preset"
                  ? "bg-white text-gray-700 shadow-sm ring-1 ring-black/5"
                  : "text-gray-700 hover:text-gray-700 hover:bg-gray-200/50"
              }`}
            >
              Preset Voices
            </button>
            <button
              onClick={() => setActiveTab("clone")}
              className={`py-2.5 px-4 rounded-lg text-sm font-bold transition-all ${
                activeTab === "clone"
                  ? "bg-white text-gray-700 shadow-sm ring-1 ring-black/5"
                  : "text-gray-700 hover:text-gray-700 hover:bg-gray-200/50"
              }`}
            >
              Clone Voice
            </button>
          </div>

          {/* DYNAMIC CONTENT AREA */}
          <div className="min-h-30">
            {activeTab === "preset" ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Select Voice Model</label>
                  <button onClick={loadVoices} className="text-xs text-blue-500 font-medium hover:text-blue-800 flex items-center gap-1 transition-colors hover:cursor-pointer">
                    <RefreshCcw className="w-3 h-3" /> Refresh List
                  </button>
                </div>
                
                {/* Scrollable Voice List */}
                {loadingVoices ? (
                   <div className="flex flex-col items-center justify-center py-8 text-gray-400 gap-2 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                      <Loader2 className="w-5 h-5 animate-spin text-gray-300" /> 
                      <span className="text-sm font-medium">Loading library...</span>
                   </div>
                ) : voices.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                    {voices.map((voice) => (
                      <button
                        key={voice}
                        onClick={() => setSelectedVoice(voice)}
                        className={`p-3 text-sm font-medium rounded-lg border text-left transition-all truncate ${
                          selectedVoice === voice
                            ? "bg-slate-500 text-white shadow-md sticky top-0 z-10"
                            : "bg-slate-100 text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {voice}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm font-medium text-center">
                    No voices found. Please check backend.
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                 <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Upload Reference Audio</label>
                 <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:bg-blue-50/50 hover:border-blue-200 transition-all relative cursor-pointer group bg-gray-50/50">
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={(e) => setCloneFile(e.target.files?.[0] || null)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="w-10 h-10 bg-white rounded-full shadow-sm border border-gray-100 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <Upload className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      {cloneFile ? cloneFile.name : "Click to upload audio file"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Supports WAV & MP3</p>
                 </div>
              </div>
            )}
          </div>

          {/* TEXT INPUT (Light Theme) */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Input Text</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full h-32 p-4 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-black focus:ring-black transition-all resize-none outline-none text-base font-medium shadow-sm"
              placeholder="Type something specific here..."
            />
          </div>

          {/* ACTION BAR */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="flex-1 bg-slate-500 text-white h-14 rounded-xl font-bold text-base hover:bg-gray-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-gray-200 hover:cursor-pointer"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-current" />}
              {loading ? "PROCESSING..." : "GENERATE SPEECH"}
            </button>

            {/* Audio Player Controls */}
            {audioUrl && (
              <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
                 <button 
                    onClick={togglePlay}
                    className="h-14 px-6 bg-white text-gray-900 rounded-xl font-bold hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm border-2 border-gray-100 min-w-27.5 justify-center hover:cursor-pointer"
                  >
                    {isPlaying ? <Pause className="w-5 h-5 fill-current text-black" /> : <Play className="w-5 h-5 fill-current text-black" />}
                    {isPlaying ? "Pause" : "Play"}
                  </button>
                  <a 
                    href={audioUrl} 
                    download="chatterbox-output.wav"
                    className="h-14 w-14 flex items-center justify-center bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200"
                  >
                    <Download className="w-5 h-5" />
                  </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
