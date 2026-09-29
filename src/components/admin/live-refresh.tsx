"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const REFRESH_MS = 10_000;
const SOUND_KEY = "kellys-admin-sound";

// Reloads the orders every 10 seconds and chimes when a new order arrives.
export function LiveRefresh({ latestNumber }: { latestNumber: number }) {
  const router = useRouter();
  const [soundOn, setSoundOn] = useState(false);
  const audio = useRef<AudioContext | null>(null);
  const seen = useRef(latestNumber);

  useEffect(() => {
    const timer = setInterval(() => router.refresh(), REFRESH_MS);
    return () => clearInterval(timer);
  }, [router]);

  // Browsers only allow sound after a tap, so a saved "on" waits for the first one.
  useEffect(() => {
    let saved = false;
    try {
      saved = window.localStorage.getItem(SOUND_KEY) === "on";
    } catch {}
    if (!saved) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSoundOn(true);
    const unlock = () => {
      audio.current ??= new AudioContext();
      void audio.current.resume();
    };
    window.addEventListener("pointerdown", unlock, { once: true });
    return () => window.removeEventListener("pointerdown", unlock);
  }, []);

  useEffect(() => {
    if (latestNumber > seen.current) {
      if (soundOn && audio.current) chime(audio.current);
      if ("vibrate" in navigator) navigator.vibrate?.([200, 100, 200]);
    }
    seen.current = latestNumber;
  }, [latestNumber, soundOn]);

  function toggle() {
    const next = !soundOn;
    setSoundOn(next);
    try {
      window.localStorage.setItem(SOUND_KEY, next ? "on" : "off");
    } catch {}
    if (next) {
      audio.current ??= new AudioContext();
      void audio.current.resume().then(() => chime(audio.current!));
    }
  }

  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h1 className="font-display text-2xl font-bold text-brand">Orders</h1>
      <button
        type="button"
        onClick={toggle}
        aria-pressed={soundOn}
        className={`min-h-11 rounded-full px-4 text-sm font-semibold ${
          soundOn
            ? "bg-brand-light text-brand"
            : "bg-white text-muted shadow-sm"
        }`}
      >
        {soundOn ? "Sound on" : "Turn on sound"}
      </button>
    </div>
  );
}

// Two short rising notes.
function chime(ctx: AudioContext) {
  const now = ctx.currentTime;
  [880, 1320].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = freq;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.0001, now + i * 0.18);
    gain.gain.exponentialRampToValueAtTime(0.4, now + i * 0.18 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.18 + 0.3);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now + i * 0.18);
    osc.stop(now + i * 0.18 + 0.32);
  });
}
