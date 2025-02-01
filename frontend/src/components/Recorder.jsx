import React, { useState, useRef } from "react";
import { FaMicrophone, FaStop, FaPlay, FaPause } from "react-icons/fa";

const Recorder = ({ onRecordingComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [transcript, setTranscript] = useState("");
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioPlayerRef = useRef(null);
  const recognitionRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      // Initialize speech recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        
        recognitionRef.current.onresult = (event) => {
          const currentTranscript = Array.from(event.results)
            .map(result => result[0])
            .map(result => result.transcript)
            .join('');
          setTranscript(currentTranscript);
        };

        recognitionRef.current.start();
      }

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/wav",
        });
        setAudioBlob(audioBlob);
        onRecordingComplete(audioBlob, transcript);
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);

      // Stop recording after 1 minute
      setTimeout(() => {
        if (mediaRecorderRef.current.state === "recording") {
          stopRecording();
        }
      }, 60000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
      setIsRecording(false);
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const togglePlayback = () => {
    if (!audioPlayerRef.current) {
      const audioUrl = URL.createObjectURL(audioBlob);
      audioPlayerRef.current = new Audio(audioUrl);
      audioPlayerRef.current.onended = () => setIsPlaying(false);
    }

    if (isPlaying) {
      audioPlayerRef.current.pause();
    } else {
      audioPlayerRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="flex items-center space-x-2">
      {!audioBlob ? (
        <button
          type="button"
          onClick={isRecording ? stopRecording : startRecording}
          className={`p-2 rounded-full ${
            isRecording ? "bg-red-500" : "bg-blue-500"
          } text-white`}
        >
          {isRecording ? <FaStop /> : <FaMicrophone />}
        </button>
      ) : (
        <button
          type="button"
          onClick={togglePlayback}
          className="p-2 rounded-full bg-green-500 text-white"
        >
          {isPlaying ? <FaPause /> : <FaPlay />}
        </button>
      )}
      {isRecording && (
        <span className="text-red-500">Recording... (max 1 min)</span>
      )}
    </div>
  );
};

export default Recorder;
