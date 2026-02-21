
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import { Mic, MicOff, Headset, Volume2, Sparkles, AlertCircle } from 'lucide-react';

interface VoiceAdvisorProps {
  studentInfo?: string;
}

const VoiceAdvisor: React.FC<VoiceAdvisorProps> = ({ studentInfo }) => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcription, setTranscription] = useState<{user: string, ai: string}>({ user: '', ai: '' });
  const [error, setError] = useState<string | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);

  const startSession = async () => {
    setIsConnecting(true);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = outputAudioContext;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsConnecting(false);
            setIsActive(true);
            const source = inputAudioContext.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContext.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle Transcriptions
            if (message.serverContent?.outputTranscription) {
              setTranscription(prev => ({ ...prev, ai: prev.ai + message.serverContent?.outputTranscription?.text }));
            } else if (message.serverContent?.inputTranscription) {
              setTranscription(prev => ({ ...prev, user: prev.user + message.serverContent?.inputTranscription?.text }));
            }
            if (message.serverContent?.turnComplete) {
              setTranscription({ user: '', ai: '' });
            }

            // Handle Audio
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContext.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContext, 24000, 1);
              const source = outputAudioContext.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputAudioContext.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error(e);
            setError("Connection failed. Please check your microphone.");
            stopSession();
          },
          onclose: () => stopSession()
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: `You are Dr. Sam, a helpful and empathetic University Success Advisor. 
          Your goal is to talk to the student and help them succeed. 
          Use the following student context if relevant: ${studentInfo || "No specific student data provided yet"}.
          Be supportive, professional, and focus on actionable advice.`
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (err) {
      setError("Could not access microphone.");
      setIsConnecting(false);
    }
  };

  const stopSession = () => {
    setIsActive(false);
    setIsConnecting(false);
    if (sessionRef.current) sessionRef.current.close();
    sessionRef.current = null;
    if (audioContextRef.current) audioContextRef.current.close();
    audioContextRef.current = null;
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-8">
      <div className="relative">
        {/* Animated Orb */}
        <div className="relative w-48 h-48 flex items-center justify-center">
          <AnimatePresence>
            {isActive && (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 bg-indigo-500 rounded-full blur-3xl opacity-20"
              />
            )}
          </AnimatePresence>
          
          <div className={`z-10 w-32 h-32 rounded-full border-4 flex items-center justify-center transition-all duration-500 ${isActive ? 'bg-indigo-600 border-indigo-400 scale-110 shadow-2xl shadow-indigo-200' : 'bg-slate-100 border-slate-200'}`}>
            {isConnecting ? (
              <Sparkles className="text-indigo-400 animate-pulse" size={40} />
            ) : isActive ? (
              <Volume2 className="text-white animate-bounce" size={40} />
            ) : (
              <Headset className="text-slate-300" size={40} />
            )}
          </div>
        </div>
      </div>

      <div className="text-center space-y-2 max-w-sm">
        <h3 className="text-xl font-black text-slate-900">
          {isActive ? 'Connected to Dr. Sam' : isConnecting ? 'Establishing Link...' : 'AI Voice Advisor'}
        </h3>
        <p className="text-slate-400 text-sm font-medium leading-relaxed">
          {isActive 
            ? 'Speak naturally. I am listening to your academic concerns.' 
            : 'Start a secure voice session for personalized guidance.'}
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs font-bold">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      <button 
        onClick={isActive ? stopSession : startSession}
        disabled={isConnecting}
        className={`px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl active:scale-95 ${
          isActive 
            ? 'bg-rose-500 text-white shadow-rose-200 hover:bg-rose-600' 
            : 'bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700'
        } ${isConnecting ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isConnecting ? 'Initializing...' : isActive ? 'End Session' : 'Start Session'}
      </button>

      {/* Real-time Transcription Bubbles */}
      <AnimatePresence>
        {(transcription.user || transcription.ai) && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-md space-y-4"
          >
            {transcription.user && (
              <div className="flex justify-end">
                <div className="bg-slate-100 p-3 rounded-2xl rounded-tr-none text-slate-700 text-xs font-medium max-w-[80%]">
                  {transcription.user}
                </div>
              </div>
            )}
            {transcription.ai && (
              <div className="flex justify-start">
                <div className="bg-indigo-600 p-3 rounded-2xl rounded-tl-none text-white text-xs font-medium max-w-[80%] shadow-lg shadow-indigo-100">
                  {transcription.ai}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Utilities ---
function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export default VoiceAdvisor;
