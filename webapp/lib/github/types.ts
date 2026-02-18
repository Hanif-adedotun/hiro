export interface RepoInfo {
  owner: string
  repo: string
}

export interface FileContent {
  name: string
  path: string
  type: 'file' | 'dir'
  content?: string
  sha?: string
}

export interface TreeItem {
  path: string
  mode: string
  type: 'blob' | 'tree'
  sha: string
  size?: number
  url?: string
}

export interface TreeData {
  sha: string
  url: string
  tree: TreeItem[]
  truncated: boolean
}

export interface PRFile {
  filename: string
  status: 'added' | 'removed' | 'modified' | 'renamed' | 'copied' | 'changed' | 'unchanged'
  additions: number
  deletions: number
  changes: number
  patch?: string
}

export const SKIP_EXTENSIONS = [
  '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.pdf', '.avif', 
  '.lock', '.gitignore', '.env', '.yml', '.yaml', 'Dockerfile', '.md'
]

