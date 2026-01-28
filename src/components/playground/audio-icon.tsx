/* eslint-disable */
import { Mic, StopCircle } from "lucide-react";
import React, { useRef, useEffect, useState } from "react";
import { toast } from "./mockApi";

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

interface AudioRecordProps {
  startRecord: () => void;
  endRecord: () => void;
  duration: number;
  setDuration: React.Dispatch<React.SetStateAction<number>>;
}

const AudioRecorderIcon = ({
  startRecord,
  endRecord,
  duration,
  setDuration,
}: AudioRecordProps) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const startRecording = async () => {
    try {
      startRecord();
      setIsRecording(true);
      setDuration(0);
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      toast.error("Error accessing microphone");
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    endRecord();
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="flex items-center gap-3">
      {!isRecording ? (
        <button
          onClick={startRecording}
          className="flex items-center cursor-pointer gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-500 text-white shadow-md hover:shadow-lg hover:scale-105 transition-transform"
        >
          <Mic className="w-5 h-5" />
          <span className="text-sm font-medium">Tap to Record</span>
        </button>
      ) : (
        <div className="flex items-center gap-3 bg-white rounded-full px-4 py-2 shadow-md border border-slate-200">
          {/* Animated pulsing mic */}
          <div
            className="w-10 h-10 cursor-pointer flex justify-center items-center rounded-full bg-red-500 text-white shadow-lg animate-pulse"
          >
            <Mic className="w-5 h-5" />
          </div>

          {/* Timer */}
          <span className="text-sm text-gray-700">
            {formatTime(duration)}
          </span>

          {/* Stop button */}
          <button
            onClick={stopRecording}
            className="p-2 cursor-pointer rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors"
          >
            <StopCircle className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default AudioRecorderIcon;
