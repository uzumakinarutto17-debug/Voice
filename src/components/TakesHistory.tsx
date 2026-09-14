import { Play, Pause, Download, Trash2, Clock, CheckCircle } from "lucide-react";
import { VoiceoverTake } from "../types";

interface TakesHistoryProps {
  takes: VoiceoverTake[];
  activeTakeId: string | null;
  isPlaying: boolean;
  onSelectTake: (take: VoiceoverTake) => void;
  onTogglePlay: () => void;
  onDeleteTake: (takeId: string) => void;
  onDownloadTake: (take: VoiceoverTake) => void;
}

export function TakesHistory({
  takes,
  activeTakeId,
  isPlaying,
  onSelectTake,
  onTogglePlay,
  onDeleteTake,
  onDownloadTake,
}: TakesHistoryProps) {
  if (takes.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-stone-400" />
          Recorded Character Takes ({takes.length})
        </h3>
        <span className="text-[11px] text-stone-500 font-mono">Click to play & compare voices</span>
      </div>

      <div className="space-y-2">
        {takes.map((take) => {
          const isActive = activeTakeId === take.id;
          return (
            <div
              key={take.id}
              className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                isActive
                  ? "bg-rose-50/70 border-rose-400 ring-1 ring-rose-400/40 shadow-xs"
                  : "bg-stone-50/50 border-stone-200 hover:bg-stone-100/70"
              }`}
            >
              <div
                className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                onClick={() => {
                  if (isActive) {
                    onTogglePlay();
                  } else {
                    onSelectTake(take);
                  }
                }}
              >
                <button
                  type="button"
                  title={isActive && isPlaying ? "Pause" : "Play"}
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                    isActive
                      ? "bg-rose-600 text-white"
                      : "bg-stone-200 text-stone-700 hover:bg-stone-300"
                  }`}
                >
                  {isActive && isPlaying ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  )}
                </button>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-stone-900 truncate">
                      Take #{take.takeNumber}
                    </span>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-stone-200 text-stone-800">
                      {take.age}yo {take.gender.toUpperCase()}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">
                      {take.emotionLabel}
                    </span>
                    {take.provider === "studio-neural-voice" ? (
                      <span className="text-[9px] font-mono font-medium px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 border border-indigo-200">
                        Neural Child
                      </span>
                    ) : take.provider === "gemini-tts" ? (
                      <span className="text-[9px] font-mono font-medium px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Gemini TTS
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono font-medium px-1.5 py-0.5 rounded bg-stone-100 text-stone-700 border border-stone-200">
                        Studio Voice
                      </span>
                    )}
                    {isActive && (
                      <span className="text-[10px] text-rose-600 font-medium flex items-center gap-0.5">
                        <CheckCircle className="w-3 h-3" /> Now Playing
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-stone-500 font-mono mt-1 truncate">
                    <span>{take.duration}s</span>
                    <span>•</span>
                    <span>Voice: {take.voice}</span>
                    <span>•</span>
                    <span className="truncate">&ldquo;{take.text}&rdquo;</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0 ml-2">
                <button
                  type="button"
                  onClick={() => onDownloadTake(take)}
                  title="Download Take WAV"
                  className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-200/60 rounded-md transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
                {takes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onDeleteTake(take.id)}
                    title="Delete Take"
                    className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
