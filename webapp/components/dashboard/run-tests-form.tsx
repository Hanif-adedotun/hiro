"use client"

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

type Repo = { id: string; name: string; fullName: string }
type FolderItem = { path: string; type: 'dir' | 'file'; name: string }

export default function RunTestsForm({ repos }: { repos: Repo[] }) {
  const [selectedRepoId, setSelectedRepoId] = useState<string>('')
  const [folders, setFolders] = useState<FolderItem[]>([])
  const [selectedFolder, setSelectedFolder] = useState<string>('')
  const [loadingFolders, setLoadingFolders] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [jobId, setJobId] = useState<string | null>(null)
  const [jobStatus, setJobStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadFolders = useCallback(async (path: string = '') => {
    if (!selectedRepoId) return
    setLoadingFolders(true)
    setError(null)
    try {
      const url = `/api/repos/${selectedRepoId}/folders${path ? `?path=${encodeURIComponent(path)}` : ''}`
      const res = await fetch(url)
      if (!res.ok) throw new Error('Failed to load folders')
      const data = await res.json()
      setFolders(data.items ?? [])
      if (!path) setSelectedFolder('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load folders')
      setFolders([])
    } finally {
      setLoadingFolders(false)
    }
  }, [selectedRepoId])

  useEffect(() => {
    if (selectedRepoId) loadFolders()
    else setFolders([])
  }, [selectedRepoId, loadFolders])

  const handleGenerate = async () => {
    if (!selectedRepoId) {
      setError('Select a repository')
      return
    }
    setSubmitting(true)
    setError(null)
    setJobId(null)
    setJobStatus(null)
    try {
      const filesRes = await fetch(
        `/api/repos/${selectedRepoId}/files?folder=${encodeURIComponent(selectedFolder)}`
      )
      if (!filesRes.ok) throw new Error('Failed to get file list')
      const { files } = await filesRes.json()
      if (!files?.length) {
        setError('No code files found in the selected folder')
        setSubmitting(false)
        return
      }
      const res = await fetch('/api/tests/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repositoryId: selectedRepoId, targetFiles: files }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to start test generation')
      }
      const { job } = await res.json()
      setJobId(job.id)
      setJobStatus(job.status)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  // Poll job status when we have a running job
  useEffect(() => {
    if (!jobId || jobStatus === 'completed' || jobStatus === 'failed') return
    const t = setInterval(async () => {
      const res = await fetch(`/api/jobs/${jobId}`)
      if (!res.ok) return
      const { job: j } = await res.json()
      setJobStatus(j.status)
    }, 2000)
    return () => clearInterval(t)
  }, [jobId, jobStatus])

  const rootDirs = folders.filter((i) => i.type === 'dir')

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground mb-4">Configuration</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Repository
            </label>
            <select
              value={selectedRepoId}
              onChange={(e) => setSelectedRepoId(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Select a repository</option>
              {repos.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.fullName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Folder
            </label>
            <select
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              disabled={loadingFolders || !selectedRepoId}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
            >
              <option value="">Entire repository</option>
              {rootDirs.map((d) => (
                <option key={d.path} value={d.path}>
                  {d.name}
                </option>
              ))}
            </select>
            {loadingFolders && (
              <p className="mt-1 text-xs text-muted-foreground">Loading folders…</p>
            )}
          </div>
        </div>
        {error && (
          <p className="mt-3 text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        <div className="mt-4">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={submitting || !selectedRepoId}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {submitting ? 'Generating…' : 'Generate Tests'}
          </button>
        </div>
      </div>

      {jobId && (
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-2">Job status</h2>
          <p className="text-sm text-muted-foreground">
            Status: <span className="font-medium text-foreground">{jobStatus}</span>
          </p>
          <Link
            href={`/unit-tests?jobId=${jobId}`}
            className="mt-2 inline-block text-sm text-primary hover:underline"
          >
            View results →
          </Link>
        </div>
      )}
    </div>
  )
}
