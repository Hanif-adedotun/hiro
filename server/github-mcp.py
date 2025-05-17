import asyncio
import os
from dotenv import load_dotenv
from mcp_use import MCPAgent, MCPClient


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
     model="llama-3.1-8b-instant",
     temperature=0.5,
     max_retries=2,
     )

    # Create agent with the client
    agent = MCPAgent(llm=llm, client=client, use_server_manager=True, max_steps=30)

    try:
        # Run the query
        result = await agent.run(
            """
            1. Can you go my github and search for the repo using search_repositories semra-website, and identify the language/framework it is written in,
            2. Identify the be most popular unit test framework for that language
            3. search through the repo and list out the files and their paths that requires unit test cases
            
            First, search for tools that could help me with each of these tasks.
            """
        )
        print(f"\nResult: {result}")
    finally:
        # Clean up all sessions
        await client.close_all_sessions()

if __name__ == "__main__":
    asyncio.run(main())