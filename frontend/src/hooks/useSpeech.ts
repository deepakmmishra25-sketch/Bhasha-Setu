"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// BCP-47 language codes for Indian languages
const LANG_CODES: Record<string, string> = {
  English: "en-IN",
  Hindi: "hi-IN",
  Tamil: "ta-IN",
  Telugu: "te-IN",
  Kannada: "kn-IN",
  Malayalam: "ml-IN",
  Gujarati: "gu-IN",
  Marathi: "mr-IN",
  Punjabi: "pa-IN",
  Bengali: "bn-IN",
  Urdu: "ur-IN",
  Odia: "or-IN",
  Assamese: "as-IN",
};

interface UseSpeechReturn {
  isListening: boolean;
  isSpeaking: boolean;
  transcript: string;
  isSTTSupported: boolean;
  isTTSSupported: boolean;
  startListening: (language?: string) => void;
  stopListening: () => void;
  speak: (text: string, language?: string) => void;
  stopSpeaking: () => void;
}

export function useSpeech(): UseSpeechReturn {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const isSTTSupported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const isTTSSupported =
    typeof window !== "undefined" && "speechSynthesis" in window;

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const startListening = useCallback(
    (language = "Hindi") => {
      if (!isSTTSupported) return;
      stopListening();

      const SR =
        (window as Window & { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition ||
        (window as Window & { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition;
      if (!SR) return;

      const recognition = new SR();
      recognition.lang = LANG_CODES[language] ?? "hi-IN";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const text = event.results[0]?.[0]?.transcript ?? "";
        setTranscript(text);
      };

      recognitionRef.current = recognition;
      recognition.start();
    },
    [isSTTSupported, stopListening]
  );

  const stopSpeaking = useCallback(() => {
    if (isTTSSupported) window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [isTTSSupported]);

  const speak = useCallback(
    (text: string, language = "Hindi") => {
      if (!isTTSSupported || !text) return;
      stopSpeaking();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = LANG_CODES[language] ?? "hi-IN";
      utterance.rate = 0.9;
      utterance.pitch = 1;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    },
    [isTTSSupported, stopSpeaking]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
      stopSpeaking();
    };
  }, [stopListening, stopSpeaking]);

  return {
    isListening,
    isSpeaking,
    transcript,
    isSTTSupported,
    isTTSSupported,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
  };
}
