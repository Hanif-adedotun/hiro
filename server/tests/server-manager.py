import asyncio
import os
from dotenv import load_dotenv
from mcp_use import MCPClient, ServerManager
from mcp_use.adapters.langchain_adapter import LangChainAdapter

async def main():
     # Load environment variables
     load_dotenv()
     
     # Create configuration dictionary
     client = MCPClient.from_config_file(
          os.path.join("github_mcp.json")
     )

     adapter = LangChainAdapter()

     # Create server manager
     server_manager = ServerManager(client=client, adapter=adapter)
     await server_manager.initialize()

     # Get server management tools
     management_tools = await server_manager.get_server_management_tools()

     # List available servers
     servers_info = await server_manager.list_servers()
     print(servers_info)

     # Connect to a specific server
     connection_result = await server_manager.connect_to_server("github")
     print(connection_result)

     # Get tools from the active server
     active_server_tools = await server_manager.get_active_server_tools()

     # Get all tools (management + active server)
     all_tools = await server_manager.get_all_tools()

     # Search for tools across all servers
     search_results = await server_manager.search_tools("search for files")
     print(search_results)

     # Use a tool from a specific server
     result = await server_manager.use_tool_from_server(
     server_name="github",
     tool_name="search_repositories",
     tool_input={"query": "semra-website"}
     )
     print(f"\nResult: {result}")

if __name__ == "__main__":
    asyncio.run(main())