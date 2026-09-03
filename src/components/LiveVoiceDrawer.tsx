import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  X,
  Volume2,
  Sparkles,
  Zap,
  AlertCircle,
  Radio,
  Send,
  Loader2,
} from 'lucide-react';
import { Trip } from '../types';

interface LiveVoiceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentTrip?: Trip | null;
}

export const LiveVoiceDrawer: React.FC<LiveVoiceDrawerProps> = ({
  isOpen,
  onClose,
  currentTrip,
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isModelSpeaking, setIsModelSpeaking] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Tap below to start real-time voice packing assistant');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [textPrompt, setTextPrompt] = useState('');
  const [isSendingText, setIsSendingText] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const nextStartTimeRef = useRef<number>(0);
  const isMutedRef = useRef(false);

  isMutedRef.current = isMicMuted;

  const floatTo16BitPCM = (float32Array: Float32Array): ArrayBuffer => {
    const buffer = new ArrayBuffer(float32Array.length * 2);
    const view = new DataView(buffer);
    let offset = 0;
    for (let i = 0; i < float32Array.length; i++, offset += 2) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    return buffer;
  };

  const base64FromArrayBuffer = (buffer: ArrayBuffer): string => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  const base64ToFloat32Array = (base64: string): Float32Array => {
    const binaryString = window.atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const int16Array = new Int16Array(bytes.buffer);
    const float32Array = new Float32Array(int16Array.length);
    for (let i = 0; i < int16Array.length; i++) {
      float32Array[i] = int16Array[i] / (int16Array[i] < 0 ? 0x8000 : 0x7fff);
    }
    return float32Array;
  };

  const stopAudioPlayback = () => {
    activeSourcesRef.current.forEach((source) => {
      try {
        source.stop();
      } catch (err) {
        // ignore already stopped
      }
    });
    activeSourcesRef.current = [];
    if (outputAudioCtxRef.current) {
      nextStartTimeRef.current = outputAudioCtxRef.current.currentTime;
    }
    setIsModelSpeaking(false);
  };

  const playAudioChunk = (base64Audio: string) => {
    if (!outputAudioCtxRef.current) return;
    const ctx = outputAudioCtxRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    try {
      const float32 = base64ToFloat32Array(base64Audio);
      const audioBuffer = ctx.createBuffer(1, float32.length, 24000);
      audioBuffer.getChannelData(0).set(float32);

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);

      const startTime = Math.max(ctx.currentTime, nextStartTimeRef.current);
      source.start(startTime);
      nextStartTimeRef.current = startTime + audioBuffer.duration;

      activeSourcesRef.current.push(source);
      setIsModelSpeaking(true);

      source.onended = () => {
        activeSourcesRef.current = activeSourcesRef.current.filter((s) => s !== source);
        if (activeSourcesRef.current.length === 0) {
          setIsModelSpeaking(false);
        }
      };
    } catch (e) {
      console.error('Audio playback chunk error:', e);
    }
  };

  const cleanupSession = () => {
    stopAudioPlayback();

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (processorRef.current) {
      try {
        processorRef.current.disconnect();
      } catch (e) {
        // ignore
      }
      processorRef.current = null;
    }

    if (inputAudioCtxRef.current && inputAudioCtxRef.current.state !== 'closed') {
      inputAudioCtxRef.current.close();
      inputAudioCtxRef.current = null;
    }

    if (outputAudioCtxRef.current && outputAudioCtxRef.current.state !== 'closed') {
      outputAudioCtxRef.current.close();
      outputAudioCtxRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.onclose = null;
      wsRef.current.onerror = null;
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsConnected(false);
    setIsConnecting(false);
    setIsModelSpeaking(false);
    setAudioLevel(0);
  };

  const startVoiceSession = async () => {
    cleanupSession();
    setIsConnecting(true);
    setErrorMessage(null);
    setStatusMessage('Requesting microphone permission...');

    try {
      // 1. Get user microphone stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      mediaStreamRef.current = stream;

      // 2. Setup AudioContexts: 16kHz for input mic, 24kHz for Gemini Live playback
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const inCtx = new AudioCtx({ sampleRate: 16000 });
      const outCtx = new AudioCtx({ sampleRate: 24000 });
      inputAudioCtxRef.current = inCtx;
      outputAudioCtxRef.current = outCtx;

      setStatusMessage('Connecting to Gemini 3.1 Flash Live API...');

      // 3. Connect WebSocket to server
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/live-ws`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setStatusMessage('Establishing live voice channel...');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'connected') {
            setIsConnecting(false);
            setIsConnected(true);
            setStatusMessage('Live & Listening. Speak naturally!');
          } else if (data.type === 'audio' && data.audio) {
            playAudioChunk(data.audio);
          } else if (data.type === 'interrupted') {
            stopAudioPlayback();
          } else if (data.type === 'turnComplete') {
            // ready for next user speech
          } else if (data.type === 'error') {
            setErrorMessage(data.error || 'Live session error');
            setIsConnecting(false);
            setIsConnected(false);
          }
        } catch (e) {
          console.error('WS message error:', e);
        }
      };

      ws.onerror = (err) => {
        console.error('WebSocket error:', err);
        setErrorMessage('Failed to connect to Live Voice server.');
        setIsConnecting(false);
        setIsConnected(false);
      };

      ws.onclose = () => {
        setIsConnected(false);
        setIsConnecting(false);
        setStatusMessage('Session disconnected. Tap to reconnect.');
      };

      // 4. Setup ScriptProcessor to capture PCM 16kHz chunks
      const sourceNode = inCtx.createMediaStreamSource(stream);
      const processor = inCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (
          !isMutedRef.current &&
          ws.readyState === WebSocket.OPEN
        ) {
          const inputData = e.inputBuffer.getChannelData(0);

          // Calculate RMS level for visualizer
          let sum = 0;
          for (let i = 0; i < inputData.length; i++) {
            sum += inputData[i] * inputData[i];
          }
          const rms = Math.sqrt(sum / inputData.length);
          setAudioLevel(Math.min(100, Math.round(rms * 500)));

          const pcm16 = floatTo16BitPCM(inputData);
          const base64 = base64FromArrayBuffer(pcm16);
          ws.send(JSON.stringify({ type: 'audio', audio: base64 }));
        }
      };

      sourceNode.connect(processor);
      processor.connect(inCtx.destination);
    } catch (err: any) {
      console.error('Microphone or connection failure:', err);
      setErrorMessage(
        err.name === 'NotAllowedError'
          ? 'Microphone permission denied. Please allow microphone access in your browser.'
          : 'Could not initialize live microphone. ' + (err.message || '')
      );
      setIsConnecting(false);
      setIsConnected(false);
      cleanupSession();
    }
  };

  const handleSendTextPrompt = (textToSend?: string) => {
    const query = textToSend || textPrompt;
    if (!query.trim()) return;

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'text', text: query }));
      setTextPrompt('');
      setStatusMessage(`Asked: "${query}"`);
    } else {
      // Fallback: call /api/assistant/advice
      setIsSendingText(true);
      fetch('/api/assistant/advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: query,
          tripContext: currentTrip ? { name: currentTrip.name, itemsCount: currentTrip.items.length } : null,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          setIsSendingText(false);
          setTextPrompt('');
          setStatusMessage(data.text || 'Advice received');
        })
        .catch((err) => {
          setIsSendingText(false);
          setErrorMessage('Failed to send text request');
        });
    }
  };

  useEffect(() => {
    if (!isOpen) {
      cleanupSession();
    }
    return () => {
      cleanupSession();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4 animate-fadeIn">
      <div className="bg-[#FAF9F6] w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl border border-[#0F172A]/10 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-[#0F172A]/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#E2E7FF] text-[#00685F] flex items-center justify-center shadow-2xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-[16px] font-bold text-[#131B2E]">Voice Assistant</h3>
                <span className="bg-[#00685F]/10 text-[#00685F] text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Radio className="w-2.5 h-2.5 animate-pulse" />
                  <span>Gemini 3.1 Live</span>
                </span>
              </div>
              <p className="text-[11px] text-[#6D7A77]">Real-time conversational packing companion</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F2F3FF] hover:bg-[#EAEDFF] text-[#131B2E] flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Audio Visualizer Stage */}
        <div className="px-5 py-6 flex flex-col items-center justify-center bg-radial from-[#F2F3FF] to-[#FAF9F6]">
          {/* Central Pulsing Avatar */}
          <div className="relative mb-5 flex items-center justify-center">
            {/* Outer animated ripple when speaking or listening */}
            {(isConnected || isModelSpeaking) && (
              <div
                className={`absolute w-32 h-32 rounded-full transition-all duration-150 ${
                  isModelSpeaking
                    ? 'bg-[#00685F]/15 animate-ping'
                    : 'bg-[#00685F]/10'
                }`}
                style={{
                  transform: `scale(${1 + audioLevel / 100})`,
                }}
              />
            )}

            <div
              className={`w-24 h-24 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 ${
                isModelSpeaking
                  ? 'bg-gradient-to-tr from-[#00685F] to-[#89F5E7] text-white scale-105'
                  : isConnected
                  ? 'bg-[#00685F] text-white'
                  : 'bg-white text-[#6D7A77] border border-[#0F172A]/10'
              }`}
            >
              {isConnecting ? (
                <Loader2 className="w-10 h-10 animate-spin text-[#00685F]" />
              ) : isModelSpeaking ? (
                <Volume2 className="w-10 h-10 animate-pulse text-white" />
              ) : isConnected ? (
                <Mic className="w-10 h-10 text-white" />
              ) : (
                <MicOff className="w-10 h-10 text-[#94A3B8]" />
              )}
            </div>
          </div>

          {/* Equalizer Visualizer Bars */}
          <div className="flex items-center justify-center gap-1.5 h-7 mb-2">
            {[20, 45, 80, 50, 100, 65, 30, 75, 40].map((h, i) => {
              const activeHeight = isConnected
                ? isModelSpeaking
                  ? Math.max(8, (h * Math.sin(Date.now() / 150 + i) + 50) % 28)
                  : Math.max(6, (audioLevel * h) / 100)
                : 4;

              return (
                <div
                  key={i}
                  className={`w-1.5 rounded-full transition-all duration-75 ${
                    isModelSpeaking
                      ? 'bg-[#00685F]'
                      : isConnected
                      ? 'bg-[#89F5E7]'
                      : 'bg-[#CBD5E1]'
                  }`}
                  style={{ height: `${activeHeight}px` }}
                />
              );
            })}
          </div>

          {/* Dynamic Status Label */}
          <p
            className={`text-center text-[13px] font-bold mt-1 px-4 leading-snug ${
              errorMessage
                ? 'text-[#DC2C4F]'
                : isModelSpeaking
                ? 'text-[#00685F]'
                : isConnected
                ? 'text-[#131B2E]'
                : 'text-[#6D7A77]'
            }`}
          >
            {errorMessage || statusMessage}
          </p>

          {/* Connected Pill Status */}
          {isConnected && (
            <div className="flex items-center gap-2 mt-2">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
              <span className="text-[11px] font-bold text-[#10B981]">
                {isModelSpeaking ? 'Gemini is speaking...' : 'Listening to you...'}
              </span>
            </div>
          )}
        </div>

        {/* Interactive Controls */}
        <div className="p-4 bg-white border-t border-[#0F172A]/5 flex flex-col gap-3">
          {/* Main Action Buttons */}
          <div className="flex items-center gap-2">
            {!isConnected && !isConnecting ? (
              <button
                type="button"
                onClick={startVoiceSession}
                className="flex-1 h-12 rounded-full bg-[#00685F] hover:bg-[#005049] text-white font-bold text-[14px] flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all cursor-pointer"
              >
                <Mic className="w-5 h-5" />
                <span>Start Voice Conversation</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setIsMicMuted(!isMicMuted)}
                  className={`h-12 px-4 rounded-full font-bold text-[13px] flex items-center justify-center gap-2 border transition-all active:scale-95 cursor-pointer ${
                    isMicMuted
                      ? 'bg-[#FFDAD6] text-[#93000A] border-[#FFDAD6]'
                      : 'bg-[#F2F3FF] text-[#131B2E] border-[#E2E7FF]'
                  }`}
                >
                  {isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-[#00685F]" />}
                  <span>{isMicMuted ? 'Muted' : 'Mute'}</span>
                </button>

                <button
                  type="button"
                  onClick={cleanupSession}
                  className="flex-1 h-12 rounded-full bg-[#DC2C4F] hover:bg-[#B31938] text-white font-bold text-[13px] flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                  <span>End Voice Session</span>
                </button>
              </>
            )}
          </div>

          {/* Quick Voice Starters */}
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold text-[#6D7A77] px-1 flex items-center gap-1">
              <Zap className="w-3 h-3 text-[#A36700]" />
              <span>Quick packing questions to speak or tap:</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                'Do I need 3 pairs of shoes for 3 days?',
                'What are carry-on liquid limits?',
                'How to fold jackets tightly?',
                'Beach essentials I might forget',
              ].map((query, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendTextPrompt(query)}
                  className="text-[11px] font-semibold bg-[#F2F3FF] hover:bg-[#EAEDFF] text-[#131B2E] px-2.5 py-1 rounded-full text-left transition-all active:scale-95 cursor-pointer"
                >
                  💬 {query}
                </button>
              ))}
            </div>
          </div>

          {/* Optional Text Input Fallback */}
          <div className="flex items-center gap-1.5 pt-1">
            <input
              type="text"
              value={textPrompt}
              onChange={(e) => setTextPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendTextPrompt()}
              placeholder="Or type a question for Gemini..."
              className="flex-1 h-9 px-3 text-[12px] rounded-full bg-[#F2F3FF] border border-[#E2E7FF] focus:outline-none focus:border-[#00685F]"
            />
            <button
              type="button"
              onClick={() => handleSendTextPrompt()}
              disabled={isSendingText || !textPrompt.trim()}
              className="w-9 h-9 rounded-full bg-[#00685F] disabled:opacity-50 text-white flex items-center justify-center active:scale-95 transition-all cursor-pointer shrink-0"
            >
              {isSendingText ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
