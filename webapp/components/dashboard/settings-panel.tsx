"use client"

import { useState } from 'react'

interface SettingsPanelProps {
  repositories: Array<{
    id: string
    name: string
    fullName: string
    enabled: boolean
    autoGenerateTests: boolean
    maxPRsPerDay: number
    protectedDirs: string[]
    onlyChangedFiles: boolean
  }>
}

export default function SettingsPanel({ repositories }: SettingsPanelProps) {
  const [repos, setRepos] = useState(repositories)

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
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Repository Settings</h2>
        <div className="space-y-6">
          {repos.map((repo) => (
            <div key={repo.id} className="border-b border-gray-200 pb-6 last:border-0">
              <h3 className="font-medium text-gray-900 mb-4">{repo.name}</h3>
              
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={repo.enabled}
                    onChange={(e) => updateRepo(repo.id, { enabled: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Enable Hiro for this repository</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={repo.autoGenerateTests}
                    onChange={(e) => updateRepo(repo.id, { autoGenerateTests: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Auto-generate tests on PR</span>
                </label>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max PRs per day
                  </label>
                  <input
                    type="number"
                    value={repo.maxPRsPerDay}
                    onChange={(e) => updateRepo(repo.id, { maxPRsPerDay: parseInt(e.target.value) })}
                    className="w-32 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    min="1"
                    max="100"
                  />
                </div>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={repo.onlyChangedFiles}
                    onChange={(e) => updateRepo(repo.id, { onlyChangedFiles: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Only analyze changed files</span>
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">GitHub App Configuration</h2>
        <p className="text-sm text-gray-600">
          Configure your GitHub App settings. Make sure your webhook URL is set to:
        </p>
        <code className="block mt-2 p-2 bg-gray-100 rounded text-sm">
          {typeof window !== 'undefined' ? window.location.origin : ''}/api/webhooks/github
        </code>
      </div>
    </div>
  )
}

