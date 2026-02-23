"use client"

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface SettingsPanelProps {
  repositories: Array<{
    id: string
    name: string
    fullName: string
    enabled: boolean
    autoGenerateTests: boolean
    watchedBranches: string[]
    maxPRsPerDay: number
    protectedDirs: string[]
    onlyChangedFiles: boolean
  }>
}

type GitHubRepo = { id: number; fullName: string; name: string; owner: string; private: boolean; defaultBranch: string }

export default function SettingsPanel({ repositories }: SettingsPanelProps) {
  const router = useRouter()
  const [repos, setRepos] = useState(repositories)
  const [addOpen, setAddOpen] = useState(false)
  const [githubRepos, setGithubRepos] = useState<GitHubRepo[]>([])
  const [addSearch, setAddSearch] = useState('')
  const [addLoading, setAddLoading] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)
  const comboboxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!addOpen) return
    setAddLoading(true)
    setAddError(null)
    fetch('/api/github/repos')
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error)
        setGithubRepos(data.repositories ?? [])
      })
      .catch((e) => setAddError(e.message))
      .finally(() => setAddLoading(false))
  }, [addOpen])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (comboboxRef.current && !comboboxRef.current.contains(e.target as Node)) {
        setAddOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const addedFullNames = new Set(repos.map((r) => r.fullName))
  const availableToAdd = githubRepos.filter(
    (r) => !addedFullNames.has(r.fullName) && (!addSearch.trim() || r.fullName.toLowerCase().includes(addSearch.toLowerCase()) || r.name.toLowerCase().includes(addSearch.toLowerCase()))
  )

  const addRepository = async (fullName: string) => {
    setAddError(null)
    try {
      const res = await fetch('/api/repos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to add repository')
      setAddOpen(false)
      setAddSearch('')
      router.refresh()
    } catch (e) {
      setAddError(e instanceof Error ? e.message : 'Failed to add')
    }
  }

  const updateRepo = async (repoId: string, updates: any) => {
    try {
      const response = await fetch(`/api/repos/${repoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        const updated = await response.json()
        setRepos(repos.map(r => r.id === repoId ? updated.repository : r))
      }
    } catch (error) {
      console.error('Error updating repository:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card shadow-sm p-6">
        <h2 className="text-lg font-semibold text-foreground mb-2">Add a Repository</h2>
        <p className="text-sm text-muted-foreground mb-3">
          Repositories you have access to on GitHub. Select one to add it to Hiro.
        </p>
        <div className="relative w-full max-w-md" ref={comboboxRef}>
          <button
            type="button"
            onClick={() => setAddOpen((o) => !o)}
            className="flex w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <span className={repos.length === 0 ? 'text-muted-foreground' : ''}>
              {repos.length === 0 ? 'Select a repository to add…' : 'Add another repository…'}
            </span>
            <svg className="h-4 w-4 shrink-0 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {addOpen && (
            <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-card shadow-lg">
              <input
                type="text"
                placeholder="Search repos…"
                value={addSearch}
                onChange={(e) => setAddSearch(e.target.value)}
                className="w-full border-b border-border bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              {addError && (
                <p className="px-3 py-2 text-sm text-destructive">{addError}</p>
              )}
              <div className="max-h-60 overflow-auto py-1">
                {addLoading ? (
                  <p className="px-3 py-4 text-sm text-muted-foreground">Loading repositories…</p>
                ) : availableToAdd.length === 0 ? (
                  <p className="px-3 py-4 text-sm text-muted-foreground">
                    {githubRepos.length === 0 ? 'No repositories found.' : 'No matching repositories or all are already added.'}
                  </p>
                ) : (
                  availableToAdd.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => addRepository(r.fullName)}
                      className="w-full px-3 py-2 text-left text-sm text-foreground hover:bg-accent"
                    >
                      {r.fullName}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card shadow-sm p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Repository Settings</h2>
        {repos.length === 0 ? (
          <p className="text-sm text-muted-foreground">Add a repository above to configure it.</p>
        ) : (
        <div className="space-y-6">
          {repos.map((repo) => (
            <div key={repo.id} className="border-b border-border pb-6 last:border-0">
              <h3 className="font-medium text-foreground mb-4">{repo.fullName}</h3>
              
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={repo.enabled}
                    onChange={(e) => updateRepo(repo.id, { enabled: e.target.checked })}
                    className="rounded border-input text-primary focus:ring-primary"
                  />
                  <span className="ml-2 text-sm text-muted-foreground">Enable Hiro for this repository</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={repo.autoGenerateTests}
                    onChange={(e) => updateRepo(repo.id, { autoGenerateTests: e.target.checked })}
                    className="rounded border-input text-primary focus:ring-primary"
                  />
                  <span className="ml-2 text-sm text-muted-foreground">Auto-generate tests (PR and push)</span>
                </label>

                {repo.autoGenerateTests && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Branches to watch (comma-separated)
                    </label>
                    <input
                      type="text"
                      defaultValue={(repo.watchedBranches ?? []).join(', ')}
                      onBlur={(e) => {
                        const branches = e.target.value
                          .split(',')
                          .map((b) => b.trim())
                          .filter(Boolean)
                        updateRepo(repo.id, { watchedBranches: branches })
                      }}
                      placeholder="main, develop"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      Push or PR to these branches will trigger suggested tests. Leave empty to use default branch only.
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Max PRs per day
                  </label>
                  <input
                    type="number"
                    value={repo.maxPRsPerDay}
                    onChange={(e) => updateRepo(repo.id, { maxPRsPerDay: parseInt(e.target.value) })}
                    className="w-32 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    min="1"
                    max="100"
                  />
                </div>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={repo.onlyChangedFiles}
                    onChange={(e) => updateRepo(repo.id, { onlyChangedFiles: e.target.checked })}
                    className="rounded border-input text-primary focus:ring-primary"
                  />
                  <span className="ml-2 text-sm text-muted-foreground">Only analyze changed files</span>
                </label>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>

      <div className="rounded-lg border border-border bg-card shadow-sm p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">GitHub App Configuration</h2>
        <p className="text-sm text-muted-foreground mb-3">
          Configure your GitHub App settings. Use these URLs:
        </p>
        <div className="space-y-2">
          <div>
            <span className="text-xs font-medium text-muted-foreground">Webhook URL</span>
            <code className="block mt-1 p-2 bg-muted rounded text-sm text-foreground">
              {typeof window !== 'undefined' ? window.location.origin : 'https://hiro.hanif.one'}/api/webhooks/github
            </code>
          </div>
          <div>
            <span className="text-xs font-medium text-muted-foreground">OAuth callback URL (login)</span>
            <code className="block mt-1 p-2 bg-muted rounded text-sm text-foreground">
              {typeof window !== 'undefined' ? window.location.origin : 'https://hiro.hanif.one'}/api/auth/callback/github
            </code>
          </div>
        </div>
      </div>
    </div>
  )
}

