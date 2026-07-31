"use client";

import type { SceneControls } from "@/components/graph/Scene";

function ToggleRow({
  label,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      title={disabled ? "Not available yet — this app is dark-only by design" : undefined}
      className="flex w-full items-center justify-between gap-4 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
    >
      <span className="text-[12px] text-zinc-300">{label}</span>
      <span
        className={`relative h-4 w-7 shrink-0 rounded-full transition-colors ${
          checked ? "bg-emerald-400/70" : "bg-white/[0.12]"
        }`}
      >
        <span
          className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-transform ${
            checked ? "translate-x-3.5" : "translate-x-0.5"
          }`}
        />
      </span>
    </button>
  );
}

export default function LeftControlsPanel({
  controls,
  onChange,
}: {
  controls: SceneControls;
  onChange: (patch: Partial<SceneControls>) => void;
}) {
  return (
    <div className="pointer-events-auto fixed left-6 top-1/2 z-20 w-52 -translate-y-1/2 rounded-2xl border border-white/[0.1] bg-[#050505]/70 p-3 shadow-2xl backdrop-blur-2xl">
      <h2 className="mb-1.5 px-2 text-[11px] font-medium uppercase tracking-wider text-zinc-500">
        Controls
      </h2>
      <div className="flex flex-col gap-0.5">
        <ToggleRow
          label="Show Links"
          checked={controls.showLinks}
          onChange={() => onChange({ showLinks: !controls.showLinks })}
        />
        <ToggleRow
          label="Physics"
          checked={controls.physicsEnabled}
          onChange={() => onChange({ physicsEnabled: !controls.physicsEnabled })}
        />
        <ToggleRow
          label="Auto Rotate"
          checked={controls.autoRotate}
          onChange={() => onChange({ autoRotate: !controls.autoRotate })}
        />
        <ToggleRow
          label="Glow"
          checked={controls.glowEnabled}
          onChange={() => onChange({ glowEnabled: !controls.glowEnabled })}
        />
        <ToggleRow
          label="Particles"
          checked={controls.particlesEnabled}
          onChange={() => onChange({ particlesEnabled: !controls.particlesEnabled })}
        />
        <ToggleRow label="Dark Mode" checked disabled onChange={() => {}} />
      </div>
    </div>
  );
}
