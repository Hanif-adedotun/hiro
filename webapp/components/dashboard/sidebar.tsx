"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { ThemeToggle } from '@/components/theme-toggle'

const CURRENT_REPO_KEY = 'hiro-current-repo-id'

const mainNavItems = [
  { href: '/', label: 'Overview', icon: ChartBarIcon },
  { href: '/unit-tests', label: 'Unit Tests', icon: DocumentCheckIcon },
  { href: '/repositories', label: 'Repositories', icon: RepositoryIcon },
  { href: '/run-tests', label: 'Run Tests', icon: PlayIcon },
  { href: '/analytics', label: 'Analytics', icon: ChartIcon },
]

const settingsNavItems = [
  { href: '/settings', label: 'GitHub', icon: GitHubIcon },
  { href: '/settings', label: 'Settings', icon: CogIcon },
]

function ChartBarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  )
}

function DocumentCheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75" />
    </svg>
  )
}

function RepositoryIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
    </svg>
  )
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
    </svg>
  )
}

function ChartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
    </svg>
  )
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
    </svg>
  )
}

function CogIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

interface Repo {
  id: string
  fullName: string
  name: string
}

interface DashboardSidebarProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
  repositories: Repo[]
}

export default function DashboardSidebar({ user, repositories }: DashboardSidebarProps) {
  const pathname = usePathname()
  const [currentRepoId, setCurrentRepoId] = useState<string | null>(null)

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem(CURRENT_REPO_KEY) : null
    const id = stored && repositories.some((r) => r.id === stored) ? stored : repositories[0]?.id ?? null
    setCurrentRepoId(id)
    if (id && id !== stored && typeof window !== 'undefined') {
      localStorage.setItem(CURRENT_REPO_KEY, id)
    }
  }, [repositories])

  const currentRepo = repositories.find((r) => r.id === currentRepoId)

  const handleRepoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value || null
    setCurrentRepoId(id)
    if (typeof window !== 'undefined') {
      if (id) localStorage.setItem(CURRENT_REPO_KEY, id)
      else localStorage.removeItem(CURRENT_REPO_KEY)
    }
  }

  const linkClass = (href: string) => {
    const isActive = pathname === href || (href !== '/' && pathname.startsWith(href))
    return `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
      isActive ? 'bg-accent text-foreground' : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
    }`
  }

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-56 flex-col border-r border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      {/* Logo + branding */}
      <div className="border-b border-border px-4 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-500 text-white">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          </span>
          <div>
            <span className="text-lg font-bold text-foreground">Hiro</span>
            <p className="text-xs text-muted-foreground">AI Testing Suite</p>
          </div>
        </Link>
        <div className="mt-3">
          <label className="sr-only" htmlFor="current-repo">
            Current repository
          </label>
          <select
            id="current-repo"
            value={currentRepoId ?? ''}
            onChange={handleRepoChange}
            className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            title="Current repository"
          >
            <option value="">Select repository…</option>
            {repositories.map((r) => (
              <option key={r.id} value={r.id}>
                {r.fullName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Main
        </p>
        <ul className="space-y-0.5">
          {mainNavItems.map(({ href, label, icon: Icon }) => (
            <li key={href + label}>
              <Link href={href} className={linkClass(href)}>
                <Icon className="h-5 w-5 shrink-0" />
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <p className="mb-2 mt-6 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Settings
        </p>
        <ul className="space-y-0.5">
          {settingsNavItems.map(({ href, label, icon: Icon }) => (
            <li key={label}>
              <Link href={href} className={linkClass(href)}>
                <Icon className="h-5 w-5 shrink-0" />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* User + theme at bottom */}
      <div className="border-t border-border p-3 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <ThemeToggle />
          <span className="text-xs text-muted-foreground">Theme</span>
        </div>
        <div className="flex items-center gap-2 rounded-md px-2 py-2 bg-muted/50">
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name || 'User'}
              width={28}
              height={28}
              className="h-7 w-7 rounded-full ring-1 ring-border"
            />
          ) : (
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-medium text-foreground ring-1 ring-border">
              {user.name?.[0] ?? user.email?.[0] ?? 'U'}
            </span>
          )}
          <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
            {user.name || user.email || 'User'}
          </span>
        </div>
        <button
          onClick={() => signOut()}
          className="w-full rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground text-left"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}