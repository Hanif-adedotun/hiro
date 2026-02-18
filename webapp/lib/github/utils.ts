import { RepoInfo } from './types'

export function getRepoInfoFromUrl(githubUrl: string): RepoInfo {
  try {
    const url = new URL(githubUrl)
    const pathParts = url.pathname.trim().split('/').filter(Boolean)
    
    if (pathParts.length < 2) {
      throw new Error('Invalid GitHub URL. Expected format: https://github.com/owner/repo')
    }
    
    return {
      owner: pathParts[0],
      repo: pathParts[1],
    }
  } catch (error) {
    throw new Error('Invalid GitHub URL format')
  }
}

export function shouldSkipFile(filename: string): boolean {
  const lowerName = filename.toLowerCase()
  return SKIP_EXTENSIONS.some(ext => 
    lowerName.endsWith(ext) || lowerName === ext
  )
}

export const SKIP_EXTENSIONS = [
  '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.pdf', '.avif', 
  '.lock', '.gitignore', '.env', '.yml', '.yaml', 'Dockerfile', '.md'
]

