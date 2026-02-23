import { Octokit } from '@octokit/rest'
import { createAppAuth } from '@octokit/auth-app'
import { RepoInfo, FileContent, TreeData, PRFile } from './types'
import { getRepoInfoFromUrl, shouldSkipFile } from './utils'

// Delay between API calls to respect rate limits
const API_DELAY = 1000 // 1 second

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export class GitHubClient {
  private octokit: Octokit
  private isAppAuth: boolean

  constructor(token?: string, appId?: string, privateKey?: string, installationId?: number) {
    if (appId && privateKey && installationId) {
      // GitHub App authentication
      this.octokit = new Octokit({
        authStrategy: createAppAuth,
        auth: {
          appId,
          privateKey,
          installationId,
        },
      })
      this.isAppAuth = true
    } else if (token) {
      // Personal access token authentication
      this.octokit = new Octokit({
        auth: token,
      })
      this.isAppAuth = false
    } else {
      throw new Error('Either token or GitHub App credentials must be provided')
    }
  }

  async getRepoInfo(githubUrl: string): Promise<RepoInfo> {
    return getRepoInfoFromUrl(githubUrl)
  }

  async getRepository(owner: string, repo: string) {
    await delay(API_DELAY)
    const { data } = await this.octokit.repos.get({
      owner,
      repo,
    })
    return data
  }

  /** List repositories the authenticated user has access to (token auth only). */
  async listRepositoriesForAuthenticatedUser(options?: { perPage?: number; page?: number }) {
    await delay(API_DELAY)
    const { data } = await this.octokit.repos.listForAuthenticatedUser({
      per_page: options?.perPage ?? 100,
      page: options?.page ?? 1,
      sort: 'updated',
    })
    return data
  }

  async getRepositoryFiles(owner: string, repo: string, path: string = '', ref?: string): Promise<FileContent[]> {
    await delay(API_DELAY)
    try {
      const { data } = await this.octokit.repos.getContent({
        owner,
        repo,
        path: path || '',
        ref,
      })

      if (Array.isArray(data)) {
        return data.map(item => ({
          name: item.name,
          path: item.path,
          type: item.type === 'file' ? 'file' : 'dir',
          sha: 'sha' in item ? item.sha : undefined,
        }))
      } else {
        return [{
          name: data.name,
          path: data.path,
          type: data.type === 'file' ? 'file' : 'dir',
          sha: 'sha' in data ? data.sha : undefined,
        }]
      }
    } catch (error: any) {
      if (error.status === 404) {
        return []
      }
      throw error
    }
  }

  async getRepoTree(owner: string, repo: string, recursive: boolean = true): Promise<TreeData> {
    await delay(API_DELAY)
    // Get repository to find default branch
    const repoData = await this.getRepository(owner, repo)
    const defaultBranch = repoData.default_branch

    await delay(API_DELAY)
    const { data } = await this.octokit.git.getTree({
      owner,
      repo,
      tree_sha: defaultBranch,
      recursive: recursive ? '1' : undefined,
    })

    return data as TreeData
  }

  async getFileContent(owner: string, repo: string, filePath: string, ref?: string): Promise<string> {
    await delay(API_DELAY)
    try {
      const { data } = await this.octokit.repos.getContent({
        owner,
        repo,
        path: filePath,
        ref,
      })

      if ('content' in data && data.encoding === 'base64') {
        return Buffer.from(data.content, 'base64').toString('utf-8')
      }
      
      throw new Error(`Could not get content for file: ${filePath}`)
    } catch (error: any) {
      if (error.status === 404) {
        throw new Error(`File not found: ${filePath}`)
      }
      throw error
    }
  }

  /**
   * Returns list of code file paths under a folder (recursive). Uses shouldSkipFile.
   * Use for "folder selection" -> targetFiles in manual test run.
   */
  async getFilePathsUnderFolder(
    owner: string,
    repo: string,
    folderPath: string = '',
    ref?: string
  ): Promise<string[]> {
    const items = await this.getRepositoryFiles(owner, repo, folderPath, ref)
    const paths: string[] = []
    for (const item of items) {
      if (item.type === 'file') {
        if (!shouldSkipFile(item.name)) paths.push(item.path)
      } else if (item.type === 'dir') {
        const sub = await this.getFilePathsUnderFolder(owner, repo, item.path, ref)
        paths.push(...sub)
      }
    }
    return paths
  }

  async getRepositoryStructure(
    owner: string,
    repo: string,
    path: string = '',
    targetFolder?: string
  ): Promise<{ fullContext: string[], allFiles: string[] }> {
    const fullContext: string[] = []
    const allFiles: string[] = []

    const items = await this.getRepositoryFiles(owner, repo, path)

    for (const item of items) {
      if (item.type === 'file') {
        // Skip non-code files
        if (shouldSkipFile(item.name)) {
          continue
        }

        try {
          const fileContent = await this.getFileContent(owner, repo, item.path)
          const contentToWrite = `\n=== File: ${item.name} ===\n${fileContent}`
          fullContext.push(contentToWrite)
          allFiles.push(item.path)
        } catch (error) {
          // Skip files that can't be read
          console.error(`Error reading file ${item.name}:`, error)
        }
      } else if (item.type === 'dir') {
        // Recursively get directory contents
        const subResult = await this.getRepositoryStructure(owner, repo, item.path, targetFolder)
        fullContext.push(...subResult.fullContext)
        allFiles.push(...subResult.allFiles)
      }
    }

    return { fullContext, allFiles }
  }

  async createBranch(owner: string, repo: string, branchName: string, baseBranch?: string): Promise<string> {
    await delay(API_DELAY)
    
    // Get default branch if not provided
    if (!baseBranch) {
      const repoData = await this.getRepository(owner, repo)
      baseBranch = repoData.default_branch
    }

    // Get the SHA of the base branch
    await delay(API_DELAY)
    const { data: refData } = await this.octokit.git.getRef({
      owner,
      repo,
      ref: `heads/${baseBranch}`,
    })

    const baseSha = refData.object.sha

    // Check if branch already exists
    try {
      await this.octokit.git.getRef({
        owner,
        repo,
        ref: `heads/${branchName}`,
      })
      return `Branch '${branchName}' already exists`
    } catch (error: any) {
      if (error.status !== 404) {
        throw error
      }
    }

    // Create new branch
    await delay(API_DELAY)
    await this.octokit.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${branchName}`,
      sha: baseSha,
    })

    return `Successfully created branch '${branchName}'`
  }

  async commitFile(
    owner: string,
    repo: string,
    branch: string,
    filePath: string,
    content: string,
    message: string
  ): Promise<string> {
    await delay(API_DELAY)

    // Get current file SHA if it exists
    let sha: string | undefined
    try {
      const { data } = await this.octokit.repos.getContent({
        owner,
        repo,
        path: filePath,
        ref: branch,
      })
      if ('sha' in data) {
        sha = data.sha
      }
    } catch (error: any) {
      if (error.status !== 404) {
        throw error
      }
    }

    const contentBase64 = Buffer.from(content).toString('base64')

    await delay(API_DELAY)
    await this.octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: filePath,
      message,
      content: contentBase64,
      branch,
      sha,
    })

    return `Successfully committed ${filePath}`
  }

  async getPullRequestFiles(owner: string, repo: string, prNumber: number): Promise<PRFile[]> {
    await delay(API_DELAY)
    const { data } = await this.octokit.pulls.listFiles({
      owner,
      repo,
      pull_number: prNumber,
    })

    return data.map(file => ({
      filename: file.filename,
      status: file.status as PRFile['status'],
      additions: file.additions,
      deletions: file.deletions,
      changes: file.changes,
      patch: file.patch,
    }))
  }

  async getPullRequest(owner: string, repo: string, prNumber: number) {
    await delay(API_DELAY)
    const { data } = await this.octokit.pulls.get({
      owner,
      repo,
      pull_number: prNumber,
    })
    return data
  }

  async createPullRequest(
    owner: string,
    repo: string,
    title: string,
    head: string,
    base: string,
    body?: string
  ) {
    await delay(API_DELAY)
    const { data } = await this.octokit.pulls.create({
      owner,
      repo,
      title,
      head,
      base,
      body,
    })
    return data
  }

  async createComment(owner: string, repo: string, issueNumber: number, body: string) {
    await delay(API_DELAY)
    const { data } = await this.octokit.issues.createComment({
      owner,
      repo,
      issue_number: issueNumber,
      body,
    })
    return data
  }

  async getInstallationRepositories() {
    await delay(API_DELAY)
    const { data } = await this.octokit.apps.listReposAccessibleToInstallation()
    return data.repositories
  }
}

// Helper function to create client from user token
export function createUserClient(token: string): GitHubClient {
  return new GitHubClient(token)
}

// Helper function to create client from GitHub App
export function createAppClient(
  appId: string,
  privateKey: string,
  installationId: number
): GitHubClient {
  return new GitHubClient(undefined, appId, privateKey, installationId)
}

