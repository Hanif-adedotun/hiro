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
    agent = MCPAgent(llm=llm, client=client, max_steps=30)

    # Run the query
    result = await agent.run(
        "List out all the files under the repo named: semra-website",
    )
    print(f"\nResult: {result}")

if __name__ == "__main__":
    asyncio.run(main())