import asyncio
import os
from dotenv import load_dotenv
from mcp_use import MCPAgent, MCPClient
from langchain_google_genai import ChatGoogleGenerativeAI

from langchain_groq import ChatGroq


async def main():
    # Load environment variables
    load_dotenv()

    # Create configuration dictionary
    client = MCPClient.from_config_file(
        os.path.join("github_mcp.json")
    )

    # Create LLM
    llm = ChatGroq(
     model="deepseek-r1-distill-llama-70b",
     temperature=0.9,
     max_retries=2,
     )
    
    # llm = ChatGoogleGenerativeAI(
    #     temperature=0.7,
    #     model="gemini-2.0-flash-001",
    #     max_tokens=500,
    #     top_p=0.9,
    # )
    

    # Create agent with the client
    agent = MCPAgent(llm=llm, client=client, use_server_manager=True, max_steps=30)

     
    try:
        # Run the first query
        result = await agent.run(
            """
            1. Can you go my github and search for the repo using search_repositories semra-website, and identify the language/framework it is written in,
            2. Identify the be most popular unit test framework for that language
            3. search through the repo and list out the files and their paths that requires unit test cases
            """
        )
        print(f"\nResult: {result}")
        
        seond_run = await agent.run(
            f"""
            Follow the steps, and use the result from above: {result}
            
            1. Loop through all the files in the repo semra-website, 
            2. Create important unit test cases, create the test file with the same name under a test folder
            3. Then commit the changes made and  create a pull request
            """
        )
        print(f"\nResult: {seond_run}")
    finally:
        # Clean up all sessions
        await client.close_all_sessions()

if __name__ == "__main__":
    asyncio.run(main())