import { useState, useEffect } from "react";
import { QuotaStatus } from "../types";
import { Activity, Gauge, Clock, ShieldCheck, RefreshCw, Cpu, ExternalLink, Zap } from "lucide-react";

interface QuotaPanelProps {
  quota: QuotaStatus | null;
  isLoading: boolean;
  onRefresh: () => void;
}

export function QuotaPanel({ quota, isLoading, onRefresh }: QuotaPanelProps) {
  const [countdown, setCountdown] = useState<number>(0);

  useEffect(() => {
    if (quota?.retryDelaySeconds && quota.retryDelaySeconds > 0) {
      setCountdown(quota.retryDelaySeconds);
    } else {
      setCountdown(0);
    }
  }, [quota?.retryDelaySeconds]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const limit = quota?.requestsLimit || 10;
  const remaining = quota ? quota.requestsRemaining : 10;
  const used = limit - remaining;
  const percentage = Math.min(100, Math.max(0, Math.round((used / limit) * 100)));

  const isExhausted = quota?.status === "exhausted" || countdown > 0;

  return (
    <div
      id="gemini-quota-panel"
      className="bg-white border border-stone-200 rounded-xl p-4 sm:p-5 shadow-2xs space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isExhausted
                ? "bg-amber-100 text-amber-700"
                : "bg-emerald-100 text-emerald-700"
            }`}
          >
            <Gauge className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              Gemini TTS API Quota Monitor
              <span
                className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full font-semibold ${
                  isExhausted
                    ? "bg-amber-100 text-amber-800"
                    : "bg-emerald-100 text-emerald-800"
                }`}
              >
                {isExhausted ? "Refreshing Quota" : "Active & Healthy"}
              </span>
            </h3>
            <p className="text-[11px] text-stone-500 font-mono">
              Model: {quota?.model || "gemini-3.1-flash-tts-preview"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          title="Refresh Quota Status"
          className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-600 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-rose-600" : ""}`} />
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Tier */}
        <div className="bg-stone-50 border border-stone-200/80 rounded-lg p-2.5">
          <span className="text-[10px] font-mono uppercase text-stone-500 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-stone-400" />
            Plan Tier
          </span>
          <p className="text-sm font-bold text-stone-800 mt-1">
            {quota?.tier || "Free Tier"}
          </p>
          <span className="text-[10px] text-stone-500 font-mono">10 req / min limit</span>
        </div>

        {/* Requests Remaining */}
        <div className="bg-stone-50 border border-stone-200/80 rounded-lg p-2.5">
          <span className="text-[10px] font-mono uppercase text-stone-500 flex items-center gap-1">
            <Zap className="w-3 h-3 text-stone-400" />
            Remaining
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span
              className={`text-lg font-extrabold font-mono ${
                remaining > 3 ? "text-emerald-600" : remaining > 0 ? "text-amber-600" : "text-rose-600"
              }`}
            >
              {remaining}
            </span>
            <span className="text-[11px] text-stone-400 font-mono">/ {limit}</span>
          </div>
          <span className="text-[10px] text-stone-500 font-mono">in current window</span>
        </div>

        {/* Cooldown / Refresh */}
        <div className="bg-stone-50 border border-stone-200/80 rounded-lg p-2.5">
          <span className="text-[10px] font-mono uppercase text-stone-500 flex items-center gap-1">
            <Clock className="w-3 h-3 text-stone-400" />
            Window Reset
          </span>
          <p className="text-sm font-bold font-mono text-stone-800 mt-1">
            {countdown > 0 ? `${countdown}s` : "Ready"}
          </p>
          <span className="text-[10px] text-stone-500 font-mono">
            {countdown > 0 ? "Replenishing slot" : "Full speed"}
          </span>
        </div>

        {/* Fallback Engine */}
        <div className="bg-stone-50 border border-stone-200/80 rounded-lg p-2.5">
          <span className="text-[10px] font-mono uppercase text-stone-500 flex items-center gap-1">
            <Cpu className="w-3 h-3 text-stone-400" />
            Acoustic Backup
          </span>
          <p className="text-sm font-bold text-stone-800 mt-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            Zero Downtime
          </p>
          <span className="text-[10px] text-stone-500 font-mono">auto-handles 429s</span>
        </div>
      </div>

      {/* Visual Usage Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-mono text-stone-600">
          <span>Capacity Utilization</span>
          <span>{percentage}% ({used} of {limit} used)</span>
        </div>
        <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              percentage > 80
                ? "bg-rose-500"
                : percentage > 50
                ? "bg-amber-500"
                : "bg-emerald-500"
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Informative Guidance */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-stone-100 text-[11px] text-stone-500">
        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          <span>
            {isExhausted
              ? "Free tier rate window active. Acoustic child voice fallback generation is active with zero delay."
              : "Direct live synthesis through Gemini 3.1 Flash TTS is fully operational."}
          </span>
        </div>
        <a
          href="https://ai.google.dev/gemini-api/docs/rate-limits"
          target="_blank"
          rel="noreferrer"
          className="text-rose-600 hover:text-rose-700 font-medium inline-flex items-center gap-1 shrink-0"
        >
          <span>Gemini Rate Limits Docs</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
