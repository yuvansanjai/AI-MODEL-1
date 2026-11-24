import { useState, useRef, useCallback } from 'react';
import { VoiceAgeEstimationResult, AgeGroup } from '../types';
import { VoiceFeatureExtractor } from '../services/audioAnalyzer';
import { useApp } from '../contexts/AppContext';

export type EstimationState = 'idle' | 'recording' | 'analyzing' | 'completed' | 'error';

export function useVoiceAgeEstimation() {
  const { setAgeGroup, setLastVoiceResult } = useApp();
  const [state, setState] = useState<EstimationState>('idle');
  const [result, setResult] = useState<VoiceAgeEstimationResult | null>(null);
  const [countdown, setCountdown] = useState<number>(4);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const extractorRef = useRef<VoiceFeatureExtractor | null>(null);
  const timerRef = useRef<number | null>(null);

  const startEstimation = useCallback(async () => {
    setState('recording');
    setErrorMessage(null);
    setCountdown(4);

    const extractor = new VoiceFeatureExtractor();
    extractorRef.current = extractor;

    const accessGranted = await extractor.startListening();

    let timeLeft = 4;
    timerRef.current = window.setInterval(() => {
      timeLeft -= 1;
      setCountdown(timeLeft);

      if (timeLeft <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        finishAnalysis(extractor, accessGranted);
      }
    }, 1000);
  }, []);

  const finishAnalysis = (extractor: VoiceFeatureExtractor, accessGranted: boolean) => {
    setState('analyzing');

    setTimeout(() => {
      let estimation: VoiceAgeEstimationResult;
      if (accessGranted) {
        estimation = extractor.stopListening();
      } else {
        // Fallback simulation based on balanced random sampling
        const presets: AgeGroup[] = ['teenagers', 'adults', 'children'];
        const chosen = presets[Math.floor(Math.random() * presets.length)];
        estimation = VoiceFeatureExtractor.getPresetSimulation(chosen);
      }

      setResult(estimation);
      setLastVoiceResult(estimation);
      setAgeGroup(estimation.ageGroup);
      setState('completed');
    }, 1200);
  };

  const applyPreset = useCallback((group: AgeGroup) => {
    setState('analyzing');
    setTimeout(() => {
      const estimation = VoiceFeatureExtractor.getPresetSimulation(group);
      setResult(estimation);
      setLastVoiceResult(estimation);
      setAgeGroup(estimation.ageGroup);
      setState('completed');
    }, 500);
  }, [setAgeGroup, setLastVoiceResult]);

  const reset = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (extractorRef.current) extractorRef.current.stopListening();
    setState('idle');
    setResult(null);
    setCountdown(4);
    setErrorMessage(null);
  }, []);

  return {
    state,
    countdown,
    result,
    errorMessage,
    startEstimation,
    applyPreset,
    reset,
  };
}
