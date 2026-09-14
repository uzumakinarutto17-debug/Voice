import { useState } from "react";
import { Sparkles, Mic, Sliders, ChevronDown, Check, User, Heart, Zap, Smile, Flame, Layers } from "lucide-react";
import { EMOTIONS, VOICE_OPTIONS } from "../data/presets";
import { EmotionOption } from "../types";

interface ScriptDirectorProps {
  scriptText: string;
  onScriptTextChange: (text: string) => void;
  actingDirection: string;
  onActingDirectionChange: (dir: string) => void;
  selectedVoice: string;
  onSelectVoice: (voice: string) => void;
  age: number;
  onAgeChange: (age: number) => void;
  gender: "boy" | "girl" | "neutral";
  onGenderChange: (gender: "boy" | "girl" | "neutral") => void;
  selectedEmotion: EmotionOption;
  onSelectEmotion: (emotion: EmotionOption) => void;
  onGenerate: () => void;
  onGenerateBatchAll: () => void;
  isGenerating: boolean;
  batchProgress: string | null;
}

export function ScriptDirector({
  scriptText,
  onScriptTextChange,
  actingDirection,
  onActingDirectionChange,
  selectedVoice,
  onSelectVoice,
  age,
  onAgeChange,
  gender,
  onGenderChange,
  selectedEmotion,
  onSelectEmotion,
  onGenerate,
  onGenerateBatchAll,
  isGenerating,
  batchProgress,
}: ScriptDirectorProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const getEmotionIcon = (id: string) => {
    switch (id) {
      case "sneering-mocking":
        return <Flame className="w-4 h-4 text-rose-600 shrink-0" />;
      case "excited-loving-cute":
        return <Heart className="w-4 h-4 text-amber-500 shrink-0" />;
      case "calm-slow-stuttering-cute":
        return <Smile className="w-4 h-4 text-emerald-600 shrink-0" />;
      case "bursting-joy-breathless":
        return <Zap className="w-4 h-4 text-indigo-600 shrink-0" />;
      default:
        return <Flame className="w-4 h-4 text-red-600 shrink-0" />;
    }
  };

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs space-y-5">
      {/* Script Line */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="script-input" className="text-xs font-semibold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
            <Mic className="w-3.5 h-3.5 text-rose-600" />
            Dialogue Line
          </label>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => onScriptTextChange("It isn't fog. It's a different kind of clarity.")}
              className="text-[11px] font-mono text-stone-700 bg-stone-100 hover:bg-stone-200 border border-stone-300 px-2 py-0.5 rounded transition-colors"
            >
              &ldquo;It isn&apos;t fog...&rdquo;
            </button>
            <button
              type="button"
              onClick={() => onScriptTextChange("[shouting angrily] Smell the Progress!")}
              className="text-[11px] font-mono text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2 py-0.5 rounded transition-colors"
            >
              &ldquo;Smell the Progress!&rdquo;
            </button>
          </div>
        </div>

        <input
          id="script-input"
          type="text"
          value={scriptText}
          onChange={(e) => onScriptTextChange(e.target.value)}
          placeholder="It isn't fog. It's a different kind of clarity."
          className="w-full px-4 py-3 text-base sm:text-lg font-bold font-mono tracking-tight text-stone-950 bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all"
        />
      </div>

      {/* Dynamic Age & Sex Configuration Card */}
      <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-stone-700" />
            Child Character Parameters
          </span>
          <span className="text-[11px] font-mono text-stone-500">
            Age & Sex directly shape voice anatomy
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Age Slider */}
          <div className="space-y-1.5 bg-white border border-stone-200/80 p-3 rounded-lg">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="age-slider" className="font-semibold text-stone-800">
                Child Age:
              </label>
              <span className="font-mono font-bold text-sm text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded">
                {age} Years Old
              </span>
            </div>
            <input
              id="age-slider"
              type="range"
              min="3"
              max="12"
              step="1"
              value={age}
              onChange={(e) => onAgeChange(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
            />
            <div className="flex justify-between text-[10px] font-mono text-stone-500">
              <span>3yo (Toddler)</span>
              <span>5yo (Preschool)</span>
              <span>8yo (Grade School)</span>
              <span>12yo (Tween)</span>
            </div>
          </div>

          {/* Sex Selection */}
          <div className="space-y-1.5 bg-white border border-stone-200/80 p-3 rounded-lg">
            <label className="font-semibold text-xs text-stone-800 block">
              Character Sex / Gender:
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-0.5 bg-stone-100 rounded-lg border border-stone-200">
              <button
                type="button"
                id="btn-gender-boy"
                onClick={() => onGenderChange("boy")}
                className={`py-1.5 text-xs font-bold rounded-md transition-all ${
                  gender === "boy"
                    ? "bg-white text-stone-900 shadow-2xs border border-stone-300"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                Boy
              </button>
              <button
                type="button"
                id="btn-gender-girl"
                onClick={() => onGenderChange("girl")}
                className={`py-1.5 text-xs font-bold rounded-md transition-all ${
                  gender === "girl"
                    ? "bg-white text-stone-900 shadow-2xs border border-stone-300"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                Girl
              </button>
              <button
                type="button"
                id="btn-gender-neutral"
                onClick={() => onGenderChange("neutral")}
                className={`py-1.5 text-xs font-bold rounded-md transition-all ${
                  gender === "neutral"
                    ? "bg-white text-stone-900 shadow-2xs border border-stone-300"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                Neutral
              </button>
            </div>
            <p className="text-[10px] text-stone-500">
              Affects vocal tract resonance, cadence, and default voice selection.
            </p>
          </div>
        </div>
      </div>

      {/* Emotion Presets */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-600">
            Select Emotion & Tone (1-4 Requested + Classic Tantrum)
          </span>
          <span className="text-xs text-rose-600 font-mono font-medium">
            Active: {selectedEmotion.shortLabel}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {EMOTIONS.map((emo) => {
            const isSelected = selectedEmotion.id === emo.id;
            return (
              <button
                key={emo.id}
                id={`btn-emotion-${emo.id}`}
                type="button"
                onClick={() => onSelectEmotion(emo)}
                className={`text-left p-3.5 rounded-xl border transition-all ${
                  isSelected
                    ? "bg-rose-50/90 border-rose-500 ring-2 ring-rose-500/20 shadow-xs"
                    : "bg-stone-50/70 border-stone-200 hover:border-stone-300 hover:bg-stone-100/60"
                }`}
              >
                <div className="flex items-center justify-between gap-2 font-bold text-xs text-stone-900 mb-1">
                  <div className="flex items-center gap-2">
                    {getEmotionIcon(emo.id)}
                    <span>{emo.label}</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-rose-600 shrink-0" />}
                </div>
                <p className="text-[11px] text-stone-600 line-clamp-2 leading-relaxed">
                  {emo.summary}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Voice Selection & Advanced Prompt */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-200">
        <div className="flex items-center gap-2">
          <label htmlFor="voice-select" className="text-xs font-semibold text-stone-700">
            Gemini Voice:
          </label>
          <select
            id="voice-select"
            value={selectedVoice}
            onChange={(e) => onSelectVoice(e.target.value)}
            className="text-xs font-semibold text-stone-900 bg-stone-50 border border-stone-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-rose-500"
          >
            {VOICE_OPTIONS.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-xs font-medium text-stone-600 hover:text-stone-900 flex items-center gap-1 transition-colors"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>{showAdvanced ? "Hide Acting Directives" : "View Acting Directives"}</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
        </button>
      </div>

      {showAdvanced && (
        <div className="space-y-1.5 pt-2">
          <label htmlFor="acting-prompt-input" className="text-xs font-semibold text-stone-700 block">
            Generated Vocal Prompt (fed to Gemini TTS):
          </label>
          <textarea
            id="acting-prompt-input"
            rows={3}
            value={actingDirection}
            onChange={(e) => onActingDirectionChange(e.target.value)}
            className="w-full text-xs font-mono p-3 bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500 text-stone-800 leading-relaxed"
          />
        </div>
      )}

      {/* Action Buttons: Generate Single + Batch All Emotions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        {/* Generate for currently selected emotion */}
        <button
          id="btn-generate-take"
          type="button"
          onClick={onGenerate}
          disabled={isGenerating}
          className="flex items-center justify-center gap-2 px-5 py-3.5 bg-rose-600 hover:bg-rose-700 active:scale-99 text-white font-semibold rounded-xl shadow-xs transition-all disabled:opacity-60 disabled:pointer-events-none"
        >
          {isGenerating && !batchProgress ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Generating {age}yo {gender} Take...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate Voice ({selectedEmotion.shortLabel})</span>
            </>
          )}
        </button>

        {/* Generate All Categories in Batch */}
        <button
          id="btn-generate-all-categories"
          type="button"
          onClick={onGenerateBatchAll}
          disabled={isGenerating}
          className="flex items-center justify-center gap-2 px-5 py-3.5 bg-stone-900 hover:bg-stone-800 active:scale-99 text-white font-semibold rounded-xl shadow-xs transition-all disabled:opacity-60 disabled:pointer-events-none"
        >
          {batchProgress ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>{batchProgress}</span>
            </>
          ) : (
            <>
              <Layers className="w-4 h-4 text-stone-300" />
              <span>Generate All 4 Categories ({age}yo {gender})</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
