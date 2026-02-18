import Groq from 'groq-sdk'
import { TestGenerationResponse, TestGenerationOptions } from './types'

const SYSTEM_PROMPT = `You are an expert unit test generation assistant. Your task is to:
1. Analyze the provided code context and identify key functionality to test
2. Generate up to 3 high-quality unit test cases per file that cover:
   - Core functionality
   - Edge cases
   - Error handling
3. Follow testing best practices:
   - Use appropriate testing framework (e.g., Jest, PyTest, JUnit)
   - Follow AAA pattern (Arrange, Act, Assert)
   - Keep tests focused and isolated
   - Use meaningful test descriptions

Requirements:
- Generate no more than 3 test cases per file
- Include necessary test framework imports
- Add clear test descriptions
- Mock external dependencies
- Handle async code appropriately
- Consider test maintainability

Provided below is the file tree of the repository. Use it to identify which files need testing and generate appropriate test cases.`

export class GroqLLM {
  private client: Groq
  private model: string

  constructor(apiKey: string, model: string = 'llama-3.3-70b-versatile') {
    this.client = new Groq({
      apiKey,
    })
    this.model = model
  }

  async generateTests(options: TestGenerationOptions): Promise<TestGenerationResponse> {
    const { fileTree, fullContext, codeContext, userPrompt = 'Generate a test function for this file' } = options

    // Limit context size to prevent token limit errors
    const maxContextLength = 4000
    const truncatedContext = fullContext.length > maxContextLength
      ? fullContext.substring(0, maxContextLength) + '...\n[Context truncated due to size limits]'
      : fullContext

    const maxTreeLength = 1000
    const truncatedTree = fileTree.length > maxTreeLength
      ? fileTree.substring(0, maxTreeLength) + '...\n[File tree truncated due to size limits]'
      : fileTree

    const prompt = `${SYSTEM_PROMPT}

File Tree:
${truncatedTree}

Repository Context:
${truncatedContext}

Code to Test:
${codeContext}

Request: ${userPrompt}

Please respond with a JSON object containing:
- "code": The generated test code (only code, no additional text)
- "metadata": Additional information needed to run the unit tests (in markdown format)
- "packages": Array of required package names (package names only, no versions)

Example response format:
{
  "code": "describe('MyFunction', () => { ... })",
  "metadata": "## Test Description\\n\\nThis test suite covers...",
  "packages": ["jest", "@testing-library/react"]
}`

    try {
      const completion = await this.client.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        model: this.model,
        temperature: 0.9,
        max_tokens: 4000,
        response_format: { type: 'json_object' },
      })

      const content = completion.choices[0]?.message?.content
      if (!content) {
        throw new Error('No response from LLM')
      }

      // Parse JSON response
      const response = JSON.parse(content) as TestGenerationResponse

      // Validate response structure
      if (!response.code || !response.metadata || !Array.isArray(response.packages)) {
        throw new Error('Invalid response format from LLM')
      }

      return response
    } catch (error) {
      console.error('Error generating tests:', error)
      throw new Error(`Failed to generate tests: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async analyzeCodeForTests(code: string, context?: string): Promise<{
    needsTests: boolean
    testFramework?: string
    suggestions?: string[]
  }> {
    const prompt = `Analyze the following code and determine:
1. Does it need unit tests? (yes/no)
2. What testing framework should be used?
3. What are the key functions/methods that need testing?

Code:
${code}

${context ? `Context: ${context}` : ''}

Respond with JSON:
{
  "needsTests": true/false,
  "testFramework": "jest" | "pytest" | "junit" | etc,
  "suggestions": ["function1", "function2", ...]
}`

    try {
      const completion = await this.client.chat.completions.create({
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        model: this.model,
        temperature: 0.7,
        response_format: { type: 'json_object' },
      })

      const content = completion.choices[0]?.message?.content
      if (!content) {
        throw new Error('No response from LLM')
      }

      return JSON.parse(content)
    } catch (error) {
      console.error('Error analyzing code:', error)
      return {
        needsTests: true,
        suggestions: [],
      }
    }
  }
}

// Factory function to create LLM instance
export function createGroqLLM(apiKey?: string): GroqLLM {
  const key = apiKey || process.env.GROQ_API_KEY
  if (!key) {
    throw new Error('GROQ_API_KEY is required')
  }
  return new GroqLLM(key)
}

