import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq

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
load_dotenv()
GROQ_API_KEY = os.environ['GROQ_KEY']

async def model():
    # Load environment variables
    
    llm = ChatGroq(
        api_key= GROQ_API_KEY,
        model="deepseek-r1-distill-llama-70b",
        temperature=0.9,
        max_retries=2,
    )
    
    return llm

async def generate_code(llm, file_tree:str, full_context: str, code_context: str, user_prompt: str) -> str:
    """
    Generate code based on context and user prompt.
    
    Args:
        llm: The language model instance
        code_context: The code context to analyze
        user_prompt: The specific code generation request
        
    Returns:
        str: Generated code
    """
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT + file_tree + full_context},
        {"role": "user", "content": f"Code Context:\n{code_context}\n\nRequest: {user_prompt}"}
    ]
    
    response = await llm.ainvoke(messages)
    return response.content

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
  