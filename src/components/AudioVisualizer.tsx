import { useEffect, useRef, MouseEvent } from "react";

interface AudioVisualizerProps {
  audioElement: HTMLAudioElement | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
}

export function AudioVisualizer({
  audioElement,
  isPlaying,
  currentTime,
  duration,
  onSeek,
}: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Setup Web Audio API Analyser on first play
  useEffect(() => {
    if (!audioElement) return;

    const setupAudioContext = () => {
      try {
        if (!audioContextRef.current) {
          const AudioContextClass =
            window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          const ctx = new AudioContextClass();
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 256;
          analyser.smoothingTimeConstant = 0.8;

          // Connect element to analyser and destination
          if (!sourceNodeRef.current) {
            const source = ctx.createMediaElementSource(audioElement);
            source.connect(analyser);
            analyser.connect(ctx.destination);
            sourceNodeRef.current = source;
          }

          audioContextRef.current = ctx;
          analyserRef.current = analyser;
        }

        if (audioContextRef.current && audioContextRef.current.state === "suspended") {
          audioContextRef.current.resume();
        }
      } catch (err) {
        console.warn("Web Audio API setup notice:", err);
      }
    };

    if (isPlaying) {
      setupAudioContext();
    }
  }, [audioElement, isPlaying]);

  // Render visualizer animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let localPhase = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // Background subtle grid
      ctx.fillStyle = "rgba(245, 245, 244, 0.6)"; // stone-100/60
      ctx.fillRect(0, 0, width, height);

      const analyser = analyserRef.current;
      const bufferLength = analyser ? analyser.frequencyBinCount : 64;
      const dataArray = new Uint8Array(bufferLength);

      let isActivelyProducingSound = false;
      if (analyser && isPlaying) {
        analyser.getByteFrequencyData(dataArray);
        const sum = dataArray.reduce((acc, val) => acc + val, 0);
        isActivelyProducingSound = sum > 50;
      }

      const numBars = 56;
      const barSpacing = 4;
      const totalSpacing = (numBars - 1) * barSpacing;
      const barWidth = Math.max(3, (width - totalSpacing - 32) / numBars);
      const startX = 16;
      const centerY = height / 2;

      localPhase += 0.05;
      const progressFraction = duration > 0 ? Math.min(1, Math.max(0, currentTime / duration)) : 0;

      for (let i = 0; i < numBars; i++) {
        const x = startX + i * (barWidth + barSpacing);
        const barProgress = i / numBars;
        const isPastCurrentTime = barProgress <= progressFraction;

        let barHeight = 6;

        if (isPlaying && isActivelyProducingSound && analyser) {
          const freqIndex = Math.floor((i / numBars) * (bufferLength / 2));
          const freqValue = dataArray[freqIndex] || 0;
          barHeight = Math.max(8, (freqValue / 255) * (height * 0.85));
        } else {
          // Static simulated waveform curve typical of an explosive shout tantrum
          const peakCenter = 0.45;
          const distFromPeak = Math.abs(barProgress - peakCenter);
          const baseEnvelope = Math.exp(-distFromPeak * 5) * (height * 0.7);
          const ripple = Math.sin(i * 0.75) * 6 + Math.cos(i * 1.5) * 4;
          barHeight = Math.max(6, baseEnvelope + ripple);
          if (isPlaying) {
            barHeight += Math.sin(localPhase + i * 0.3) * 6;
          }
        }

        const topY = centerY - barHeight / 2;
        const radius = barWidth / 2;

        // Color coding:
        // Hot amber/red gradient for the tantrum scream
        if (isPastCurrentTime) {
          ctx.fillStyle = isPlaying
            ? "rgba(225, 29, 72, 0.95)" // rose-600
            : "rgba(234, 88, 12, 0.9)"; // orange-600
        } else {
          ctx.fillStyle = "rgba(168, 162, 158, 0.4)"; // stone-400/40
        }

        // Draw rounded bar
        ctx.beginPath();
        ctx.roundRect(x, topY, barWidth, barHeight, [radius]);
        ctx.fill();
      }

      // Draw playhead scrubber indicator
      if (duration > 0) {
        const playheadX = startX + progressFraction * (numBars * (barWidth + barSpacing) - barSpacing);
        ctx.strokeStyle = "#dc2626"; // red-600
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(playheadX, 4);
        ctx.lineTo(playheadX, height - 4);
        ctx.stroke();

        // Playhead diamond tip
        ctx.fillStyle = "#dc2626";
        ctx.beginPath();
        ctx.arc(playheadX, 6, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, currentTime, duration]);

  // Click on visualizer to seek
  const handleCanvasClick = (e: MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || duration <= 0) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left - 16;
    const activeWidth = rect.width - 32;
    const ratio = Math.max(0, Math.min(1, clickX / activeWidth));
    onSeek(ratio * duration);
  };

  return (
    <div className="relative w-full h-28 bg-stone-100 rounded-xl overflow-hidden border border-stone-200 select-none shadow-inner">
      <canvas
        ref={canvasRef}
        width={720}
        height={112}
        onClick={handleCanvasClick}
        className="w-full h-full cursor-pointer"
        title="Click waveform to scrub audio"
      />
      <div className="absolute top-2 right-3 pointer-events-none flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-stone-500 bg-white/80 px-2 py-0.5 rounded border border-stone-200/80 backdrop-blur-xs">
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            isPlaying ? "bg-rose-500 animate-ping" : "bg-stone-400"
          }`}
        />
        {isPlaying ? "LIVE SPECTRUM" : "CLICK WAVEFORM TO SEEK"}
      </div>
    </div>
  );
}
