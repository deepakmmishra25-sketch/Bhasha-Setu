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

// Browser Speech Recognition API — webkit-prefixed in many browsers
interface ISpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  start(): void;
  stop(): void;
}

type SpeechRecognitionCtor = new () => ISpeechRecognition;

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as Record<string, unknown>;
  return (w["SpeechRecognition"] as SpeechRecognitionCtor | undefined) ??
    (w["webkitSpeechRecognition"] as SpeechRecognitionCtor | undefined) ??
    null;
}

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
  const recognitionRef = useRef<ISpeechRecognition | null>(null);

  const isSTTSupported =
    typeof window !== "undefined" &&
    !!(getSpeechRecognitionCtor());

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
      const SR = getSpeechRecognitionCtor();
      if (!SR) return;
      stopListening();

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
    [stopListening]
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
