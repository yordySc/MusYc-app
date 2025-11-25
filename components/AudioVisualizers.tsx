import React, { useMemo } from 'react';
import { View } from 'react-native';
import { ThemeText } from './Theme';

interface WaveformProps {
  data: number[];
  height?: number;
  color?: string;
  backgroundColor?: string;
  barWidth?: number;
  gap?: number;
  maxValue?: number;
}

export const Waveform: React.FC<WaveformProps> = ({
  data,
  height = 60,
  color = '#84FFC6',
  backgroundColor = 'rgba(255,255,255,0.1)',
  barWidth = 2,
  gap = 1,
  maxValue = 100,
}) => {
  const bars = useMemo(() => {
    if (data.length === 0) return [];

    const containerWidth = 300;
    const totalBars = Math.floor(containerWidth / (barWidth + gap));
    const step = Math.max(1, Math.floor(data.length / totalBars));

    return data
      .filter((_, i) => i % step === 0)
      .slice(-totalBars)
      .map(val => (val / maxValue) * height);
  }, [data, height, barWidth, gap, maxValue]);

  return (
    <View
      style={{
        height,
        backgroundColor,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'center',
        gap,
        paddingVertical: 8,
        paddingHorizontal: 4,
      }}
    >
      {bars.length === 0 ? (
        <ThemeText className="text-xs text-gray-400">Esperando audio...</ThemeText>
      ) : (
        bars.map((barHeight, idx) => (
          <View
            key={idx}
            style={{
              width: barWidth,
              height: Math.max(2, barHeight),
              backgroundColor: barHeight > height * 0.7 ? '#FF6B6B' : color,
              borderRadius: 2,
              opacity: 0.8 + (barHeight / height) * 0.2,
            }}
          />
        ))
      )}
    </View>
  );
};

interface CircularProgressProps {
  progress: number; // 0-100
  size?: number;
  thickness?: number;
  backgroundColor?: string;
  progressColor?: string;
  children?: React.ReactNode;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  progress,
  size = 200,
  thickness = 8,
  backgroundColor = 'rgba(255,255,255,0.1)',
  progressColor = '#84FFC6',
  children,
}) => {
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View
      style={{
        width: size,
        height: size,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
      }}
    >
      <svg
        width={size}
        height={size}
        style={{
          position: 'absolute',
          transform: 'rotate(-90deg)',
        }}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={backgroundColor}
          strokeWidth={thickness}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={progressColor}
          strokeWidth={thickness}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 0.3s ease',
          }}
        />
      </svg>
      {children}
    </View>
  );
};

interface StabilityMeterProps {
  stability: number; // 0-100
  width?: number;
  height?: number;
}

export const StabilityMeter: React.FC<StabilityMeterProps> = ({
  stability,
  width = 300,
  height = 8,
}) => {
  const getColor = (value: number) => {
    if (value >= 80) return '#84FFC6'; // Verde
    if (value >= 60) return '#FFD015'; // Amarillo
    if (value >= 40) return '#FF9500'; // Naranja
    return '#FF6B6B'; // Rojo
  };

  return (
    <View
      style={{
        width,
        height,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 10,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
      }}
    >
      <View
        style={{
          width: `${stability}%`,
          height: '100%',
          backgroundColor: getColor(stability),
          borderRadius: 10,
        }}
      />
    </View>
  );
};
