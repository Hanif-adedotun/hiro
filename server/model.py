import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from pydantic import BaseModel, Field


class ResponseFormatter(BaseModel):
    """Always use this tool to structure your response to the user."""
    metadata: str = Field(description="Additional information needed to run the unit tests. Write this in markdown format")
    code: str = Field(description="The generated code for the user's request. Only code, no additional text.")
    packages: list[str] = Field(description="List of required packages for the code. Package names only.")


# Load environment variables first
load_dotenv('.env')

# Get API key with error handling
GROQ_API_KEY = os.environ['GROQ_API_KEY']


if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY not found in environment variables. Please check your .env file.")

SYSTEM_PROMPT = """
You are an expert unit test generation assistant. Your task is to:
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

Provided below is the file tree of the repository. Use it to identify which files need testing and generate appropriate test cases.
"""

async def model():
    # Load environment variables
    
    llm = ChatGroq(
        api_key= GROQ_API_KEY,
        model="llama-3.3-70b-versatile",
        temperature=0.9,
        max_retries=2,
    )
    
#     model_with_structured_output = llm.with_structured_output(schema=ResponseFormatter)
    model_with_tools = llm.bind_tools([ResponseFormatter])
    
    return model_with_tools

async def generate_code(llm, file_tree:str, full_context: str, code_context: str, user_prompt: str) -> str:
    """
    Generate code based on context and user prompt.
    
    Args:
        llm: The language model instance
        file_tree: Repository file structure
        full_context: Full repository context
        code_context: The specific code to analyze
        user_prompt: The specific code generation request
        
    Returns:
        ResponseFormatter: Structured response containing code and metadata
    """
    # Limit context size to prevent token limit errors
    max_context_length = 4000  # Adjust this value based on your needs
    if len(full_context) > max_context_length:
        full_context = full_context[:max_context_length] + "...\n[Context truncated due to size limits]"
    
    if len(file_tree) > 1000:  # Limit file tree size
        file_tree = file_tree[:1000] + "...\n[File tree truncated due to size limits]"
    
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT + "\nFile Tree:\n" + file_tree + "\nRepository Context:\n" + full_context},
        {"role": "user", "content": f"Code to Test:\n{code_context}\n\nRequest: {user_prompt}"}
    ]
    
    response = await llm.ainvoke(messages)
    return response

async def main():
    # Example usage
    llm = await model()
    
    # Example code context and prompt
    code_context = """
    # Example context
    def existing_function():
        pass
    """
    
    user_prompt = "Generate a test function for the existing_function"
    
    generated_code = await generate_code(llm, "", "", code_context, user_prompt)
    print(generated_code)

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
  