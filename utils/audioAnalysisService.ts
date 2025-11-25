import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

type AudioAnalysisCallback = (data: {
  frequency: number[];
  rms: number;
  stability: number;
  isSpeaking: boolean;
}) => void;

class AudioAnalysisService {
  private recording: Audio.Recording | null = null;
  private isMonitoring = false;
  private metering: number[] = [];
  private callback: AudioAnalysisCallback | null = null;
  private monitoringInterval: NodeJS.Timeout | null = null;

  async initialize() {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        // Permiso de micrófono denegado.
        return false;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
      });
      return true;
    } catch (err) {
      // Audio initialization error
      return false;
    }
  }

  async startMonitoring(callback: AudioAnalysisCallback) {
    if (this.recording) {
      await this.stopMonitoring();
    }

    try {
      this.callback = callback;
      this.recording = new Audio.Recording();

      await this.recording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      await this.recording.startAsync();

      this.isMonitoring = true;
      this.monitoringInterval = setInterval(() => {
        this.analyzeAudio();
      }, 100);

      return true;
    } catch (err) {
      // Start monitoring error
      return false;
    }
  }

  async stopMonitoring() {
    this.isMonitoring = false;

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    try {
      if (this.recording) {
        // Verificar que el recorder esté en estado válido antes de detener
        const status = await this.recording.getStatusAsync();
        if (status.isRecording || status.isDoneRecording) {
          await this.recording.stopAndUnloadAsync();
        }
        this.recording = null;
      }
    } catch (err: any) {
      // Silenciar errores si el recorder no existe o ya está detenido
      if (!err?.message?.includes('does not exist')) {
        // Stop monitoring error
      }
      this.recording = null;
    }
  }

  private async analyzeAudio() {
    if (!this.recording || !this.isMonitoring || !this.callback) return;

    try {
      const status = await this.recording.getStatusAsync();

      if (status.isRecording && status.metering !== undefined && status.metering !== null) {
        const db = status.metering;
        const normalizedValue = Math.max(0, Math.min(100, (db + 40) * 2.5));

        this.metering.push(normalizedValue);
        if (this.metering.length > 50) {
          this.metering.shift();
        }

        const stability = this.calculateStability(this.metering);
        const rms = this.calculateRMS(this.metering);
        const isSpeaking = rms > 20;

        const frequency = this.simulateFrequencyBands(normalizedValue);

        if (this.callback) {
          this.callback({
            frequency,
            rms,
            stability,
            isSpeaking,
          });
        }
      }
    } catch (err) {
      // Audio analysis error
    }
  }

  private calculateStability(values: number[]): number {
    if (values.length < 2) return 100;

    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    return Math.max(0, Math.min(100, 100 - stdDev));
  }

  private calculateRMS(values: number[]): number {
    if (values.length === 0) return 0;
    const sumSquares = values.reduce((sum, v) => sum + v * v, 0);
    return Math.sqrt(sumSquares / values.length);
  }

  private simulateFrequencyBands(amplitude: number): number[] {
    
    const bands = [];
    for (let i = 0; i < 8; i++) {
      const variance = Math.random() * 0.2;
      const band = Math.max(0, Math.min(100, amplitude * (0.8 + variance)));
      bands.push(band);
    }
    return bands;
  }

  triggerHapticFeedback(type: 'light' | 'medium' | 'heavy' = 'light') {
    try {
      switch (type) {
        case 'light':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'medium':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'heavy':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
      }
    } catch (err) {
      // Haptic feedback error
    }
  }
}

export const audioAnalysisService = new AudioAnalysisService();