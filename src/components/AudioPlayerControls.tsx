import { Play, Pause, RotateCcw, Volume2, VolumeX, Download, Repeat, Sparkles, Mic, MicOff } from "lucide-react";
import { VoiceoverTake } from "../types";

interface AudioPlayerControlsProps {
  currentTake: VoiceoverTake | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackRate: number;
  isLooping: boolean;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (vol: number) => void;
  onPlaybackRateChange: (rate: number) => void;
  onToggleLoop: () => void;
  onDownload: () => void;
  onInstantRetake: () => void;
  isGenerating: boolean;
  onSpeakBrowserSpeech?: () => void;
  isSpeakingBrowser?: boolean;
}

export function AudioPlayerControls({
  currentTake,
  isPlaying,
  currentTime,
  duration,
  volume,
  playbackRate,
  isLooping,
  onTogglePlay,
  onSeek,
  onVolumeChange,
  onPlaybackRateChange,
  onToggleLoop,
  onDownload,
  onInstantRetake,
  isGenerating,
  onSpeakBrowserSpeech,
  isSpeakingBrowser = false,
}: AudioPlayerControlsProps) {
  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return "0:00.0";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const tenths = Math.floor((seconds % 1) * 10);
    return `${mins}:${secs.toString().padStart(2, "0")}.${tenths}`;
  };

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
      {/* Time & Playhead Progress bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-mono text-stone-500">
          <div className="flex items-center gap-2">
            <span className="text-stone-900 font-semibold">{formatTime(currentTime)}</span>
            {currentTake?.provider === "studio-neural-voice" ? (
              <span className="text-[10px] font-sans px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 font-semibold border border-indigo-200">
                Studio Neural Child Voice
              </span>
            ) : currentTake?.provider === "gemini-tts" ? (
              <span className="text-[10px] font-sans px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
                Gemini 3.1 Neural Voice
              </span>
            ) : (
              <span className="text-[10px] font-sans px-1.5 py-0.5 rounded bg-stone-100 text-stone-800 font-medium border border-stone-200">
                Spoken Voice Audio
              </span>
            )}
          </div>
          <span>{formatTime(duration)}</span>
        </div>
        <input
          id="audio-progress-slider"
          type="range"
          min="0"
          max={duration || 1}
          step="0.01"
          value={currentTime}
          onChange={(e) => onSeek(parseFloat(e.target.value))}
          disabled={!currentTake}
          aria-label="Audio timeline progress"
          className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-rose-600 disabled:opacity-40"
        />
      </div>

      {/* Main Controls Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2">
          {/* Replay / Rewind button */}
          <button
            id="btn-rewind"
            type="button"
            onClick={() => onSeek(0)}
            disabled={!currentTake}
            title="Rewind to start"
            className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors disabled:opacity-40"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Big Play / Pause Button */}
          <button
            id="btn-play-pause"
            type="button"
            onClick={onTogglePlay}
            disabled={!currentTake}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 active:scale-98 text-white font-medium rounded-lg shadow-xs transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            {isPlaying ? (
              <>
                <Pause className="w-5 h-5 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>Play Audio</span>
              </>
            )}
          </button>

          {/* Browser Speech API Fallback Live Button */}
          {onSpeakBrowserSpeech && (
            <button
              id="btn-speak-browser"
              type="button"
              onClick={onSpeakBrowserSpeech}
              title="Speak spoken dialogue aloud instantly with browser text-to-speech"
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-all ${
                isSpeakingBrowser
                  ? "bg-amber-600 text-white border-amber-700 animate-pulse shadow-2xs"
                  : "bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-300"
              }`}
            >
              {isSpeakingBrowser ? (
                <>
                  <MicOff className="w-3.5 h-3.5" />
                  <span>Stop Speaking</span>
                </>
              ) : (
                <>
                  <Mic className="w-3.5 h-3.5 text-rose-600" />
                  <span>Speak Line</span>
                </>
              )}
            </button>
          )}

          {/* Loop toggle */}
          <button
            id="btn-loop-toggle"
            type="button"
            onClick={onToggleLoop}
            disabled={!currentTake}
            title={isLooping ? "Looping enabled" : "Enable continuous loop"}
            className={`p-2 rounded-lg transition-colors ${
              isLooping
                ? "bg-rose-100 text-rose-700 border border-rose-200"
                : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
            } disabled:opacity-40`}
          >
            <Repeat className="w-4 h-4" />
          </button>
        </div>

        {/* Speed & Volume controls */}
        <div className="flex items-center gap-3">
          {/* Speed Pills */}
          <div className="flex items-center border border-stone-200 rounded-lg p-0.5 bg-stone-50 text-xs font-mono">
            {[0.8, 1.0, 1.25].map((rate) => (
              <button
                key={rate}
                id={`btn-speed-${rate}`}
                type="button"
                onClick={() => onPlaybackRateChange(rate)}
                className={`px-2 py-1 rounded-md transition-colors ${
                  playbackRate === rate
                    ? "bg-white text-stone-900 font-bold shadow-2xs"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>

          {/* Volume Slider */}
          <div className="hidden sm:flex items-center gap-1.5 text-stone-600">
            <button
              id="btn-volume-toggle"
              type="button"
              onClick={() => onVolumeChange(volume === 0 ? 1 : 0)}
              title={volume === 0 ? "Unmute" : "Mute"}
              className="p-1 hover:text-stone-900 transition-colors"
            >
              {volume === 0 ? <VolumeX className="w-4 h-4 text-stone-400" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              id="volume-slider"
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              aria-label="Volume slider"
              className="w-16 h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-700"
            />
          </div>

          {/* Download Button */}
          <button
            id="btn-download-wav"
            type="button"
            onClick={onDownload}
            disabled={!currentTake}
            title="Download high-fidelity WAV file"
            className="flex items-center gap-1.5 px-3 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium rounded-lg transition-colors shadow-2xs disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span> WAV
          </button>
        </div>
      </div>
    </div>
  );
}
