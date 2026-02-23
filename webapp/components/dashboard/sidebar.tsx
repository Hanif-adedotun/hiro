"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { ThemeToggle } from '@/components/theme-toggle'

const CURRENT_REPO_KEY = 'hiro-current-repo-id'

const navItems = [
  { href: '/', label: 'Overview' },
  { href: '/run-tests', label: 'Run Tests' },
  { href: '/unit-tests', label: 'Unit Tests' },
  { href: '/auto', label: 'Auto mode' },
  { href: '/test-intelligence', label: 'Test Intelligence' },
  { href: '/actions', label: 'Actions' },
  { href: '/vibe-score', label: 'Vibe Score' },
  { href: '/pr-analyzer', label: 'PR Analyzer' },
  { href: '/settings', label: 'Settings' },
]

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

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-56 border-r border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 flex flex-col">
      <div className="border-b border-border px-4 py-3">
        <Link
          href="/"
          className="text-xl font-bold text-foreground transition-opacity hover:opacity-90 block"
        >
          Hiro
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
          {currentRepo && (
            <p className="mt-1 text-xs text-muted-foreground truncate" title={currentRepo.fullName}>
              {currentRepo.fullName}
            </p>
          )}
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-0.5">
          {navItems.map(({ href, label }) => {
            const isActive = pathname === href || (href !== '/' && pathname.startsWith(href))
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-accent text-foreground'
                      : 'text-foreground/80 hover:bg-accent/50 hover:text-foreground'
                  }`}
                >
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
      <div className="border-t border-border p-3 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <ThemeToggle />
          <span className="text-xs text-muted-foreground">Theme</span>
        </div>
        <div className="flex items-center gap-2 rounded-md px-2 py-2 bg-muted/50">
          {user.image && (
            <Image
              src={user.image}
              alt={user.name || 'User'}
              width={28}
              height={28}
              className="h-7 w-7 rounded-full ring-1 ring-border"
            />
          )}
          <span className="min-w-0 flex-1 truncate text-sm text-foreground">
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
  )
}
