export interface TestGenerationResponse {
  code: string
  metadata: string
  packages: string[]
}

export interface TestGenerationOptions {
  fileTree: string
  fullContext: string
  codeContext: string
  userPrompt?: string
  maxTests?: number
}

