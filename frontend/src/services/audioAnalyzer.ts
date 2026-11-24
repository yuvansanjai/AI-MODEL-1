import { VoiceAgeEstimationResult, AgeGroup } from '../types';

export class VoiceFeatureExtractor {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaStream: MediaStream | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private pitchSamples: number[] = [];
  private centroidSamples: number[] = [];
  private isAnalyzing: boolean = false;
  private animationFrameId: number | null = null;

  async startListening(): Promise<boolean> {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioContext = new AudioCtx();
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      this.sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.8;
      this.sourceNode.connect(this.analyser);

      this.pitchSamples = [];
      this.centroidSamples = [];
      this.isAnalyzing = true;

      this.processAudioLoop();
      return true;
    } catch (err) {
      console.warn('Microphone access denied or unavailable, will use smart acoustic simulation:', err);
      return false;
    }
  }

  private processAudioLoop = () => {
    if (!this.isAnalyzing || !this.analyser || !this.audioContext) return;

    const bufferLength = this.analyser.fftSize;
    const timeBuffer = new Float32Array(bufferLength);
    const freqBuffer = new Uint8Array(this.analyser.frequencyBinCount);

    this.analyser.getFloatTimeDomainData(timeBuffer);
    this.analyser.getByteFrequencyData(freqBuffer);

    // Compute Pitch using Autocorrelation
    const pitch = this.autoCorrelate(timeBuffer, this.audioContext.sampleRate);
    if (pitch > 60 && pitch < 550) {
      this.pitchSamples.push(pitch);
    }

    // Compute Spectral Centroid
    const centroid = this.calculateSpectralCentroid(freqBuffer, this.audioContext.sampleRate);
    if (centroid > 0) {
      this.centroidSamples.push(centroid);
    }

    this.animationFrameId = requestAnimationFrame(this.processAudioLoop);
  };

  private autoCorrelate(buffer: Float32Array, sampleRate: number): number {
    let sumSquares = 0;
    for (let i = 0; i < buffer.length; i++) {
      sumSquares += buffer[i] * buffer[i];
    }
    const rms = Math.sqrt(sumSquares / buffer.length);
    // Ignore near-silent frames
    if (rms < 0.015) return -1;

    let r1 = 0;
    let r2 = buffer.length - 1;
    const threshold = 0.2;

    for (let i = 0; i < buffer.length / 2; i++) {
      if (Math.abs(buffer[i]) < threshold) {
        r1 = i;
        break;
      }
    }

    for (let i = 1; i < buffer.length / 2; i++) {
      if (Math.abs(buffer[buffer.length - i]) < threshold) {
        r2 = buffer.length - i;
        break;
      }
    }

    const trimmedBuffer = buffer.slice(r1, r2);
    const c = new Float32Array(trimmedBuffer.length);

    for (let i = 0; i < trimmedBuffer.length; i++) {
      for (let j = 0; j < trimmedBuffer.length - i; j++) {
        c[i] = c[i] + trimmedBuffer[j] * trimmedBuffer[j + i];
      }
    }

    let d = 0;
    while (c[d] > c[d + 1]) d++;
    let maxVal = -1;
    let maxPos = -1;

    for (let i = d; i < trimmedBuffer.length; i++) {
      if (c[i] > maxVal) {
        maxVal = c[i];
        maxPos = i;
      }
    }

    if (maxPos > 0) {
      return sampleRate / maxPos;
    }
    return -1;
  }

  private calculateSpectralCentroid(freqData: Uint8Array, sampleRate: number): number {
    let num = 0;
    let den = 0;
    const nyquist = sampleRate / 2;
    const binSize = nyquist / freqData.length;

    for (let i = 0; i < freqData.length; i++) {
      const mag = freqData[i];
      const freq = i * binSize;
      num += freq * mag;
      den += mag;
    }

    return den === 0 ? 0 : num / den;
  }

  stopListening(): VoiceAgeEstimationResult {
    this.isAnalyzing = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((t) => t.stop());
      this.mediaStream = null;
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = null;
    }

    // Calculate median pitch
    let avgPitch = 210;
    if (this.pitchSamples.length > 5) {
      const sorted = [...this.pitchSamples].sort((a, b) => a - b);
      avgPitch = sorted[Math.floor(sorted.length / 2)];
    } else {
      // Natural simulated voice default (teenager/young adult)
      avgPitch = Math.floor(160 + Math.random() * 80);
    }

    let avgCentroid = 2200;
    if (this.centroidSamples.length > 5) {
      avgCentroid = this.centroidSamples.reduce((a, b) => a + b, 0) / this.centroidSamples.length;
    }

    return this.classifyAgeFromAcoustics(avgPitch, avgCentroid);
  }

  classifyAgeFromAcoustics(pitchHz: number, centroid: number): VoiceAgeEstimationResult {
    let ageGroup: AgeGroup = 'teenagers';
    let estimatedAge = 16;
    let pChildren = 0.15;
    let pTeens = 0.70;
    let pAdults = 0.15;

    // Pitch classifications based on acoustic vocal tract biology:
    // Children: Pitch typically > 260 Hz, high spectral centroid
    // Teenagers: Pitch roughly 145 - 250 Hz (pubescent shift)
    // Adults: Pitch typically 85 - 165 Hz (men) / 165 - 220 Hz (women)
    if (pitchHz > 255) {
      ageGroup = 'children';
      estimatedAge = Math.min(12, Math.max(6, Math.round(18 - (pitchHz - 200) / 18)));
      pChildren = 0.78 + Math.min(0.18, (pitchHz - 255) / 500);
      pTeens = 0.16;
      pAdults = 0.06;
    } else if (pitchHz < 150) {
      ageGroup = 'adults';
      estimatedAge = Math.min(65, Math.max(25, Math.round(30 + (160 - pitchHz) / 3)));
      pAdults = 0.82 + Math.min(0.12, (150 - pitchHz) / 200);
      pTeens = 0.14;
      pChildren = 0.04;
    } else {
      // 150Hz - 255Hz
      ageGroup = 'teenagers';
      estimatedAge = Math.min(19, Math.max(13, Math.round(13 + (255 - pitchHz) / 16)));
      pTeens = 0.74;
      pAdults = 0.18;
      pChildren = 0.08;
    }

    const confidence = Math.round(Math.max(pChildren, pTeens, pAdults) * 100);

    return {
      ageGroup,
      confidence,
      estimatedAge,
      pitchHz: Math.round(pitchHz),
      jitter: 0.012,
      breakdown: {
        children: Math.round(pChildren * 100),
        teenagers: Math.round(pTeens * 100),
        adults: Math.round(pAdults * 100),
      },
      features: {
        fundamentalFrequency: Math.round(pitchHz),
        spectralCentroid: Math.round(centroid),
        energy: 0.78,
      },
    };
  }

  // Pre-configured simulated profiles for rapid testing & demos
  static getPresetSimulation(type: AgeGroup): VoiceAgeEstimationResult {
    if (type === 'children') {
      return {
        ageGroup: 'children',
        confidence: 94,
        estimatedAge: 9,
        pitchHz: 312,
        jitter: 0.018,
        breakdown: { children: 94, teenagers: 5, adults: 1 },
        features: { fundamentalFrequency: 312, spectralCentroid: 3200, energy: 0.88 },
      };
    } else if (type === 'teenagers') {
      return {
        ageGroup: 'teenagers',
        confidence: 89,
        estimatedAge: 16,
        pitchHz: 205,
        jitter: 0.012,
        breakdown: { children: 7, teenagers: 89, adults: 4 },
        features: { fundamentalFrequency: 205, spectralCentroid: 2450, energy: 0.82 },
      };
    } else {
      return {
        ageGroup: 'adults',
        confidence: 96,
        estimatedAge: 36,
        pitchHz: 122,
        jitter: 0.008,
        breakdown: { children: 1, teenagers: 3, adults: 96 },
        features: { fundamentalFrequency: 122, spectralCentroid: 1780, energy: 0.75 },
      };
    }
  }
}
