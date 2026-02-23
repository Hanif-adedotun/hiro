"use client"

import { ThemeToggle } from "@/components/theme-toggle"

export function LoginShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Left: form panel — always white in both themes for clarity (AWS-style) */}
      <div className="flex w-full flex-col items-center justify-center bg-white px-8 py-12 lg:w-1/2 lg:px-16">
        <div className="absolute right-4 top-4 lg:right-6 lg:top-6">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-sm">{children}</div>
      </div>

      {/* Right: branded panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-12 relative overflow-hidden">
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `
              linear-gradient(to right, white 1px, transparent 1px),
              linear-gradient(to bottom, white 1px, transparent 1px)
            `,
            backgroundSize: "48px 48px",
          }}
        />
        {/* Glow accent */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute bottom-20 right-20 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative z-10 text-center">
          <div className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-6 py-3 backdrop-blur-sm">
            <span className="text-sm font-medium text-white/90">AI-Powered Test Generation</span>
          </div>
          <h2 className="mt-8 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Ship with confidence
          </h2>
          <p className="mt-4 max-w-sm text-lg text-white/70">
            Let Hiro generate and maintain tests so you can focus on building.
          </p>
          <div className="mt-10 flex justify-center gap-6">
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold text-white">→</span>
              <span className="mt-1 text-xs text-white/60">Connect repo</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold text-white">→</span>
              <span className="mt-1 text-xs text-white/60">AI tests</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold text-emerald-400">✓</span>
              <span className="mt-1 text-xs text-white/60">Ship</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
