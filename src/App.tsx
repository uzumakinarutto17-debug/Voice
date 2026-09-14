import { useState, useEffect, useRef } from "react";
import { AudioVisualizer } from "./components/AudioVisualizer";
import { AudioPlayerControls } from "./components/AudioPlayerControls";
import { ScriptDirector } from "./components/ScriptDirector";
import { TakesHistory } from "./components/TakesHistory";
import { QuotaPanel } from "./components/QuotaPanel";
import { EMOTIONS, buildActingPrompt } from "./data/presets";
import { VoiceoverTake, EmotionOption, QuotaStatus } from "./types";
import { speakDialogueInBrowser, stopBrowserSpeech } from "./utils/speechFallback";
import {
  Flame,
  AlertCircle,
  Sparkles,
  Volume2,
  Info,
  Layers,
  RefreshCw,
  CheckCircle2,
  Gauge,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function App() {
  const [scriptText, setScriptText] = useState("It isn't fog. It's a different kind of clarity.");
  const [age, setAge] = useState<number>(5);
  const [gender, setGender] = useState<"boy" | "girl" | "neutral">("boy");
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionOption>(EMOTIONS[0]);
  const [selectedVoice, setSelectedVoice] = useState<string>("Puck");
  const [actingDirection, setActingDirection] = useState<string>(
    buildActingPrompt(5, "boy", EMOTIONS[0])
  );

  const [takes, setTakes] = useState<VoiceoverTake[]>([]);
  const [activeTakeId, setActiveTakeId] = useState<string | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLooping, setIsLooping] = useState(false);
  const [isSpeakingBrowser, setIsSpeakingBrowser] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);
  const [batchProgress, setBatchProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  // Quota monitor state
  const [quota, setQuota] = useState<QuotaStatus | null>(null);
  const [isQuotaLoading, setIsQuotaLoading] = useState(false);
  const [isQuotaPanelVisible, setIsQuotaPanelVisible] = useState(true);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const activeTake = takes.find((t) => t.id === activeTakeId) || takes[0] || null;

  // Fetch current quota status
  const fetchQuotaStatus = async () => {
    setIsQuotaLoading(true);
    try {
      const res = await fetch("/api/quota");
      if (res.ok) {
        const data = await res.json();
        setQuota(data);
      }
    } catch (e) {
      console.warn("Failed to check quota:", e);
    } finally {
      setIsQuotaLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotaStatus();
    const interval = setInterval(fetchQuotaStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  // Handlers for dynamic parameters
  const handleAgeChange = (newAge: number) => {
    setAge(newAge);
    setActingDirection(buildActingPrompt(newAge, gender, selectedEmotion));
  };

  const handleGenderChange = (newGender: "boy" | "girl" | "neutral") => {
    setGender(newGender);
    if (newGender === "girl" && (selectedVoice === "Puck" || selectedVoice === "Fenrir")) {
      setSelectedVoice("Kore");
    } else if (newGender === "boy" && (selectedVoice === "Kore" || selectedVoice === "Aoede")) {
      setSelectedVoice("Puck");
    }
    setActingDirection(buildActingPrompt(age, newGender, selectedEmotion));
  };

  const handleSelectEmotion = (emotion: EmotionOption) => {
    setSelectedEmotion(emotion);
    setActingDirection(buildActingPrompt(age, gender, emotion));
  };

  // Generate single voiceover take
  const handleGenerateVoiceover = async (
    targetEmotion?: EmotionOption,
    customAge?: number,
    customGender?: "boy" | "girl" | "neutral"
  ): Promise<VoiceoverTake | null> => {
    const emo = targetEmotion || selectedEmotion;
    const currentAge = customAge ?? age;
    const currentGender = customGender ?? gender;
    const dir = buildActingPrompt(currentAge, currentGender, emo);

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/voiceover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: scriptText.trim() || "[shouting angrily] Smell the Progress!",
          age: currentAge,
          gender: currentGender,
          emotionId: emo.id,
          actingDirection: dir,
          voice: selectedVoice,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to generate voiceover take");
      }

      if (data.notice) {
        setStatusNotice(data.notice);
      } else {
        setStatusNotice(null);
      }

      // Refresh quota immediately after generation
      fetchQuotaStatus();

      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

      const newTake: VoiceoverTake = {
        id: `take-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        takeNumber: takes.length + 1,
        title: `Take (${currentAge}yo ${currentGender} - ${emo.shortLabel})`,
        text: scriptText.trim() || "Smell the Progress!",
        actingDirection: dir,
        voice: data.voice || selectedVoice,
        audioUrl: data.audioUrl,
        duration: data.duration || 2.4,
        sampleRate: data.sampleRate || 24000,
        createdAt: timeStr,
        emotionId: emo.id,
        emotionLabel: emo.shortLabel,
        age: currentAge,
        gender: currentGender,
        provider: data.provider,
        isFallback: data.isFallback,
      };

      setTakes((prev) => [newTake, ...prev]);
      setActiveTakeId(newTake.id);

      // Play audio
      if (audioRef.current) {
        audioRef.current.src = newTake.audioUrl;
        audioRef.current.load();
        audioRef.current.playbackRate = playbackRate;
        audioRef.current.volume = volume;
        audioRef.current.loop = isLooping;

        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => setIsPlaying(true))
            .catch(() => setIsPlaying(false));
        }
      }

      return newTake;
    } catch (err: any) {
      console.error("Voiceover error:", err);
      setError(err?.message || "An error occurred while generating audio.");
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  // Batch generate all 4 requested categories sequentially with polite inter-request pacing
  const handleGenerateBatchAll = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setError(null);

    const targetEmotions = EMOTIONS.slice(0, 4); // The 4 user requested categories
    const newTakesList: VoiceoverTake[] = [];

    try {
      for (let i = 0; i < targetEmotions.length; i++) {
        const emo = targetEmotions[i];
        setBatchProgress(`Generating Category ${i + 1}/4: ${emo.shortLabel}...`);

        const dir = buildActingPrompt(age, gender, emo);
        const response = await fetch("/api/voiceover", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: scriptText.trim() || "[shouting angrily] Smell the Progress!",
            age,
            gender,
            emotionId: emo.id,
            actingDirection: dir,
            voice: selectedVoice,
          }),
        });

        const data = await response.json();
        if (response.ok && data.success) {
          if (data.notice) {
            setStatusNotice(data.notice);
          }
          const now = new Date();
          const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
          const take: VoiceoverTake = {
            id: `take-${Date.now()}-${i}`,
            takeNumber: takes.length + i + 1,
            title: `Take (${age}yo ${gender} - ${emo.shortLabel})`,
            text: scriptText.trim() || "Smell the Progress!",
            actingDirection: dir,
            voice: data.voice || selectedVoice,
            audioUrl: data.audioUrl,
            duration: data.duration || 2.4,
            sampleRate: data.sampleRate || 24000,
            createdAt: timeStr,
            emotionId: emo.id,
            emotionLabel: emo.shortLabel,
            age,
            gender,
            provider: data.provider,
            isFallback: data.isFallback,
          };
          newTakesList.push(take);
        }

        // Inter-request pacing
        if (i < targetEmotions.length - 1) {
          await new Promise((r) => setTimeout(r, 600));
        }
      }

      // Update quota status
      fetchQuotaStatus();

      if (newTakesList.length > 0) {
        setTakes((prev) => [...newTakesList.reverse(), ...prev]);
        setActiveTakeId(newTakesList[0].id);

        if (audioRef.current) {
          audioRef.current.src = newTakesList[0].audioUrl;
          audioRef.current.load();
          audioRef.current.playbackRate = playbackRate;
          audioRef.current.volume = volume;
          audioRef.current
            .play()
            .then(() => setIsPlaying(true))
            .catch(() => setIsPlaying(false));
        }
      }
    } catch (err: any) {
      console.error("Batch error:", err);
      setError("Batch generation encountered an issue. Some takes may have been recorded.");
    } finally {
      setIsGenerating(false);
      setBatchProgress(null);
    }
  };

  // Auto-generate initial take on mount
  useEffect(() => {
    handleGenerateVoiceover();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync active take selection
  const handleSelectTake = (take: VoiceoverTake) => {
    setActiveTakeId(take.id);
    if (audioRef.current) {
      audioRef.current.src = take.audioUrl;
      audioRef.current.load();
      audioRef.current.playbackRate = playbackRate;
      audioRef.current.volume = volume;
      audioRef.current.loop = isLooping;
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  // Play / Pause toggle
  const handleTogglePlay = () => {
    if (isSpeakingBrowser) {
      stopBrowserSpeech();
      setIsSpeakingBrowser(false);
      return;
    }
    if (!audioRef.current || !activeTake) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (!audioRef.current.src || !audioRef.current.src.includes(activeTake.audioUrl.slice(0, 30))) {
        audioRef.current.src = activeTake.audioUrl;
        audioRef.current.load();
      }
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((e) => {
          console.warn("Audio playback error, invoking browser speech fallback:", e);
          handleSpeakBrowserSpeech();
        });
    }
  };

  // Seek timeline
  const handleSeek = (time: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  // Volume change
  const handleVolumeChange = (vol: number) => {
    setVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
  };

  // Playback speed change
  const handlePlaybackRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  // Loop toggle
  const handleToggleLoop = () => {
    const nextLoop = !isLooping;
    setIsLooping(nextLoop);
    if (audioRef.current) {
      audioRef.current.loop = nextLoop;
    }
  };

  // Speak dialogue line using browser native speech synthesis
  const handleSpeakBrowserSpeech = () => {
    if (isSpeakingBrowser) {
      stopBrowserSpeech();
      setIsSpeakingBrowser(false);
      return;
    }

    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }

    const currentLine = activeTake?.text || scriptText || "Smell the Progress!";
    const currentAge = activeTake?.age ?? age;
    const currentGender = activeTake?.gender ?? gender;
    const currentEmotion = activeTake?.emotionId ?? selectedEmotion.id;

    speakDialogueInBrowser(
      currentLine,
      currentAge,
      currentGender,
      currentEmotion,
      () => setIsSpeakingBrowser(true),
      () => setIsSpeakingBrowser(false)
    );
  };

  // Download WAV
  const handleDownload = (takeToDownload?: VoiceoverTake) => {
    const target = takeToDownload || activeTake;
    if (!target) return;
    const a = document.createElement("a");
    a.href = target.audioUrl;
    const safeText = target.text.replace(/[^a-zA-Z0-9]/g, "-").slice(0, 20).toLowerCase();
    a.download = `child-voice-${target.age}yo-${target.gender}-${target.emotionId}-${safeText}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Delete a take
  const handleDeleteTake = (id: string) => {
    setTakes((prev) => {
      const remaining = prev.filter((t) => t.id !== id);
      if (activeTakeId === id && remaining.length > 0) {
        setActiveTakeId(remaining[0].id);
        if (audioRef.current) {
          audioRef.current.src = remaining[0].audioUrl;
        }
      }
      return remaining;
    });
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      {/* Hidden standard HTML5 audio element */}
      <audio
        ref={audioRef}
        onTimeUpdate={() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
          }
        }}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration);
          }
        }}
        onEnded={() => {
          if (!isLooping) {
            setIsPlaying(false);
          }
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Header */}
      <header className="border-b border-stone-200 bg-white sticky top-0 z-20 shadow-2xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-rose-600 flex items-center justify-center text-white shadow-xs">
              <Flame className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-stone-950 tracking-tight flex items-center gap-2">
                Child Voiceover Character Studio
                <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                  Gemini 3.1 TTS
                </span>
              </h1>
              <p className="text-xs text-stone-500 font-mono hidden sm:block">
                Dynamic Age & Sex • 4 Expressive Child Voice Styles
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsQuotaPanelVisible(!isQuotaPanelVisible)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                isQuotaPanelVisible
                  ? "bg-stone-800 text-white border-stone-800"
                  : "bg-white text-stone-700 hover:bg-stone-100 border-stone-300"
              }`}
            >
              <Gauge className="w-3.5 h-3.5" />
              <span>Quota Panel</span>
              {isQuotaPanelVisible ? (
                <ChevronUp className="w-3.5 h-3.5 text-stone-300" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-stone-500" />
              )}
            </button>

            <button
              type="button"
              onClick={() => handleGenerateBatchAll()}
              disabled={isGenerating}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-semibold border border-stone-300 transition-colors disabled:opacity-50"
            >
              <Layers className="w-3.5 h-3.5 text-stone-600" />
              <span>Generate All 4 Styles</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Studio Body */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1 w-full space-y-6">
        {/* Quota Panel Component */}
        {isQuotaPanelVisible && (
          <QuotaPanel
            quota={quota}
            isLoading={isQuotaLoading}
            onRefresh={fetchQuotaStatus}
          />
        )}

        {/* Status notice banner if quota was reached and fallback handled */}
        {statusNotice && (
          <div className="flex items-start gap-3 p-3.5 bg-amber-50/90 border border-amber-200 rounded-xl text-xs text-amber-900">
            <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Spoken Voice Engine Active</p>
              <p className="mt-0.5 text-amber-700 leading-relaxed">{statusNotice}</p>
            </div>
            <button
              type="button"
              onClick={() => setStatusNotice(null)}
              className="text-amber-500 hover:text-amber-800 font-bold px-1.5 text-sm"
            >
              ×
            </button>
          </div>
        )}

        {/* Error Notification */}
        {error && (
          <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Voice Generation Notice</p>
              <p className="mt-0.5 text-rose-700">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => handleGenerateVoiceover()}
              className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded text-xs transition-colors shrink-0"
            >
              Retry
            </button>
          </div>
        )}

        {/* Script & Voiceover Target Banner */}
        <section className="bg-stone-900 text-white rounded-2xl p-5 sm:p-7 shadow-sm border border-stone-800 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-rose-400 font-mono text-xs tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Voice Target Profile</span>
            </div>
            {activeTake && (
              <span className="text-xs font-mono text-stone-300 bg-stone-800 px-2.5 py-1 rounded">
                Playing: {activeTake.age}yo {activeTake.gender.toUpperCase()} • {activeTake.emotionLabel}
                {activeTake.isFallback && " (Spoken Voice)"}
              </span>
            )}
          </div>

          <div className="space-y-1">
            <p className="text-xs font-mono text-rose-300 uppercase tracking-wider">
              [Dialogue Line]
            </p>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white font-mono">
              &ldquo;{scriptText.replace(/^\[.*?\]\s*/, "") || scriptText}&rdquo;
            </h2>
          </div>

          {/* Parameters Badges */}
          <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
            <span className="bg-stone-800 text-stone-200 px-2.5 py-1 rounded-md font-mono border border-stone-700">
              Age: <strong className="text-white">{age} Years Old</strong>
            </span>
            <span className="bg-stone-800 text-stone-200 px-2.5 py-1 rounded-md font-mono border border-stone-700">
              Sex: <strong className="text-white">{gender.toUpperCase()}</strong>
            </span>
            <span className="bg-rose-950 text-rose-300 border border-rose-800 px-2.5 py-1 rounded-md font-medium">
              Tone: {selectedEmotion.shortLabel}
            </span>
            <span className="bg-stone-800 text-stone-300 px-2.5 py-1 rounded-md font-mono border border-stone-700">
              Voice: {selectedVoice}
            </span>
          </div>
        </section>

        {/* Live Audio Visualizer & Player Controls */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-rose-600" />
              Audio Spectrum & Playback Controls
            </h3>
            {isGenerating && (
              <span className="text-xs text-rose-600 font-medium animate-pulse flex items-center gap-1 font-mono">
                <RefreshCw className="w-3 h-3 animate-spin" />
                {batchProgress || "Synthesizing voiceover audio..."}
              </span>
            )}
          </div>

          {/* Waveform Canvas */}
          <AudioVisualizer
            audioElement={audioRef.current}
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            onSeek={handleSeek}
          />

          {/* Controls Bar */}
          <AudioPlayerControls
            currentTake={activeTake}
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            volume={volume}
            playbackRate={playbackRate}
            isLooping={isLooping}
            onTogglePlay={handleTogglePlay}
            onSeek={handleSeek}
            onVolumeChange={handleVolumeChange}
            onPlaybackRateChange={handlePlaybackRateChange}
            onToggleLoop={handleToggleLoop}
            onDownload={() => handleDownload()}
            onInstantRetake={() => handleGenerateVoiceover()}
            isGenerating={isGenerating}
            onSpeakBrowserSpeech={handleSpeakBrowserSpeech}
            isSpeakingBrowser={isSpeakingBrowser}
          />
        </section>

        {/* Interactive Script & Emotion Director */}
        <ScriptDirector
          scriptText={scriptText}
          onScriptTextChange={setScriptText}
          actingDirection={actingDirection}
          onActingDirectionChange={setActingDirection}
          selectedVoice={selectedVoice}
          onSelectVoice={setSelectedVoice}
          age={age}
          onAgeChange={handleAgeChange}
          gender={gender}
          onGenderChange={handleGenderChange}
          selectedEmotion={selectedEmotion}
          onSelectEmotion={handleSelectEmotion}
          onGenerate={() => handleGenerateVoiceover()}
          onGenerateBatchAll={handleGenerateBatchAll}
          isGenerating={isGenerating}
          batchProgress={batchProgress}
        />

        {/* Multi-Take History */}
        <TakesHistory
          takes={takes}
          activeTakeId={activeTakeId}
          isPlaying={isPlaying}
          onSelectTake={handleSelectTake}
          onTogglePlay={handleTogglePlay}
          onDeleteTake={handleDeleteTake}
          onDownloadTake={handleDownload}
        />

        {/* Emotion Reference Guide */}
        <section className="bg-stone-100/70 border border-stone-200/80 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-stone-700 text-xs font-semibold uppercase tracking-wider">
              <Info className="w-3.5 h-3.5 text-stone-500" />
              Supported Child Emotion Styles & Acoustic Profiles
            </div>
            <button
              type="button"
              onClick={handleGenerateBatchAll}
              disabled={isGenerating}
              className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1"
            >
              <Layers className="w-3 h-3" />
              Generate all 4 styles now
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {EMOTIONS.slice(0, 4).map((emo) => (
              <div
                key={emo.id}
                onClick={() => handleSelectEmotion(emo)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedEmotion.id === emo.id
                    ? "bg-white border-rose-500 ring-1 ring-rose-400 shadow-2xs"
                    : "bg-white/60 border-stone-200 hover:bg-white"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-stone-900 text-xs">
                    {emo.shortLabel}
                  </span>
                  <span className="text-[10px] font-mono text-stone-400">#{emo.num}</span>
                </div>
                <p className="text-[11px] leading-relaxed text-stone-600">
                  {emo.summary}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 py-4 bg-white text-center text-xs text-stone-500 font-mono">
        Child Voiceover Character Studio • Powered by Gemini 3.1 TTS • 24kHz Studio Quality
      </footer>
    </div>
  );
}
