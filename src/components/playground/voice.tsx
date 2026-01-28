import { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "./mockApi";
/* eslint-disable */

interface UseRealtimeAudioProps {
  wsUrl: string;
  sessionId: string | null;
  setExecutionLogs: React.Dispatch<React.SetStateAction<any[]>>;
}

interface UseRealtimeAudioReturn {
  connected: boolean;
  transcript: string;
  start: () => Promise<void>;
  stop: () => void;
}

export function useRealtimeAudio({
  wsUrl,
  sessionId,
  setExecutionLogs,
}: UseRealtimeAudioProps): UseRealtimeAudioReturn {
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const inputRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // --- Audio playback management ---
  const currentSource = useRef<AudioBufferSourceNode | null>(null);
  const audioQueueRef = useRef<Float32Array[]>([]);
  const isPlayingRef = useRef(false);

  const [transcript, setTranscript] = useState<string>("");
  const [connected, setConnected] = useState<boolean>(false);

  const connectWebSocket = useCallback(() => {
    if (!sessionId) {
      toast.error("please create testing environment");
      return;
    }
    if (wsRef.current) return; // avoid duplicate connections

    const url = `${wsUrl}/${sessionId}`;
    wsRef.current = new WebSocket(url);

    wsRef.current.onopen = () => {
      setConnected(true);
    };

    wsRef.current.onmessage = async (event: MessageEvent) => {
      if (typeof event.data === "string") {
        try {
          const data = JSON.parse(event.data);
          const t = data.type;

          // --- Barge-in logic ---
          if (
            t === "input_audio_buffer.speech_started" ||
            t === "response.interrupted" ||
            t === "response.cancelled" ||
            t === "response.created"
          ) {
            audioQueueRef.current = [];
            if (currentSource.current) {
              try {
                currentSource.current.stop(0);
              } catch (_) { }
              currentSource.current.disconnect();
              currentSource.current = null;
            }
            isPlayingRef.current = false;
          }

          if (t === "response.text.delta" && data.delta) {
            setTranscript((prev) => prev + data.delta);
          }
          if (t === "response.text.final") {
            setTranscript((prev) => prev + "\n");
          }
          if (t === 'agents_logs') {
            setExecutionLogs((agents: any) => [...agents, data.payload]);
          }
          if (t === 'status_update') {
            let statusMessage = data.payload.message;
            setExecutionLogs((prev) => [...prev, {
              type: "handoff",
              status: "completed",
              tool_name: statusMessage.title || "Agent Handoff",
              message: `${statusMessage.message} (${statusMessage.decision})`,
              details: {},
              confidence: 1,
              timestamp: new Date().toISOString()
            }]);
          }
        } catch (e) {
          console.error("Error parsing message JSON:", e);
        }
      } else if (event.data instanceof Blob) {
        const arrayBuffer = await event.data.arrayBuffer();
        const view = new DataView(arrayBuffer);
        const floatBuffer = new Float32Array(view.byteLength / 2);

        for (let i = 0; i < floatBuffer.length; i++) {
          floatBuffer[i] = view.getInt16(i * 2, true) / 32768;
        }

        audioQueueRef.current.push(floatBuffer);
        playAudioQueue();
      }
    };

    wsRef.current.onclose = () => {
      setConnected(false);
      wsRef.current = null;
    };

    wsRef.current.onerror = () => {
      wsRef.current?.close();
    };
  }, [wsUrl, sessionId, setExecutionLogs]);

  // --- Play audio queue sequentially ---
  const playAudioQueue = useCallback(async () => {
    if (isPlayingRef.current || audioQueueRef.current.length === 0) return;

    isPlayingRef.current = true;

    while (audioQueueRef.current.length > 0) {
      const chunk = audioQueueRef.current.shift();
      if (!chunk || !audioContextRef.current || audioContextRef.current.state === "closed") {
        isPlayingRef.current = false;
        return;
      }

      const buffer = audioContextRef.current.createBuffer(1, chunk.length, audioContextRef.current.sampleRate);
      buffer.copyToChannel(chunk, 0);

      const source = audioContextRef.current.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContextRef.current.destination);
      currentSource.current = source;

      const playPromise = new Promise<void>((resolve) => {
        source.onended = () => {
          if (currentSource.current === source) currentSource.current = null;
          resolve();
        };
      });

      source.start();
      await playPromise;

      if (!isPlayingRef.current) break; // interrupted
    }

    isPlayingRef.current = false;
  }, []);

  // --- Start Recording ---
  const start = async () => {
    setTranscript("");
    connectWebSocket();

    audioContextRef.current = new (window.AudioContext ||
      (window as any).webkitAudioContext)({ sampleRate: 24000 });

    streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
    inputRef.current = audioContextRef.current.createMediaStreamSource(streamRef.current);

    processorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);
    processorRef.current.onaudioprocess = (e: AudioProcessingEvent) => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

      const data = e.inputBuffer.getChannelData(0);
      const pcm16 = new Int16Array(data.length);
      for (let i = 0; i < data.length; i++) {
        let s = Math.max(-1, Math.min(1, data[i]!));
        pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
      }
      const base64 = btoa(String.fromCharCode(...new Uint8Array(pcm16.buffer)));
      wsRef.current.send(JSON.stringify({ type: "input_audio_buffer.append", audio: base64 }));
    };

    inputRef.current.connect(processorRef.current);
    processorRef.current.connect(audioContextRef.current.destination);
  };

  // --- Stop Recording ---
  const stop = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "input_audio_buffer.commit" }));
      wsRef.current.send(
        JSON.stringify({
          type: "response.create",
          response: { modalities: ["audio", "text"] },
        })
      );
    }

    processorRef.current?.disconnect();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    inputRef.current?.disconnect();
    wsRef.current?.close();
    wsRef.current = null;
    audioContextRef.current?.close();
    setConnected(false);
  };

  useEffect(() => {
    return () => {
      wsRef.current?.close();
      audioContextRef.current?.close();
    };
  }, []);

  return {
    connected,
    transcript,
    start,
    stop,
  };
}
