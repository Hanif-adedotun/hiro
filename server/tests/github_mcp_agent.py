from langchain.agents import AgentExecutor, create_openai_functions_agent
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_openai import ChatOpenAI
from langchain.tools import Tool
from langchain_community.utilities.github import GitHubAPIWrapper
from typing import Dict, Any
import os

class GitHubMCPAgent:
    def __init__(self, github_token: str):
        self.github = GitHubAPIWrapper(github_token=github_token)
        self.llm = ChatOpenAI(temperature=0, model="gpt-4-turbo-preview")
        self.tools = self._create_tools()
        self.agent = self._create_agent()

    def _create_tools(self) -> list:
        """Create tools for the agent to use."""
        return [
            Tool(
                name="get_file_contents",
                func=self.github.get_file_contents,
                description="Get the contents of a file from a GitHub repository. Required parameters: owner (string), repo (string), path (string)"
            ),
            Tool(
                name="list_repos",
                func=self.github.list_repos,
                description="List repositories for a GitHub user or organization. Required parameter: username (string)"
            ),
            Tool(
                name="search_repos",
                func=self.github.search_repos,
                description="Search for GitHub repositories. Required parameter: query (string)"
            )
        ]

    def _create_agent(self) -> AgentExecutor:
        """Create the agent with the specified tools and prompt."""
        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are a helpful AI assistant that helps with GitHub repository operations.
            You can retrieve file contents, list repositories, and search for repositories.
            Always verify the required parameters before making any API calls."""),
            MessagesPlaceholder(variable_name="chat_history"),
            ("human", "{input}"),
            MessagesPlaceholder(variable_name="agent_scratchpad"),
        ])

        agent = create_openai_functions_agent(self.llm, self.tools, prompt)
        return AgentExecutor(agent=agent, tools=self.tools, verbose=True)

    def get_file_contents(self, owner: str, repo: str, path: str) -> Dict[str, Any]:
        """
        Get the contents of a file from a GitHub repository.
        
        Args:
            owner (str): Repository owner
            repo (str): Repository name
            path (str): Path to the file in the repository
            
        Returns:
            Dict[str, Any]: File contents and metadata
        """
        try:
            return self.agent.invoke({
                "input": f"Get the contents of the file at {path} in the repository {owner}/{repo}"
            })
        except Exception as e:
            return {"error": str(e)}

    def list_repositories(self, username: str) -> Dict[str, Any]:
        """
        List repositories for a GitHub user or organization.
        
        Args:
            username (str): GitHub username or organization name
            
        Returns:
            Dict[str, Any]: List of repositories
        """
        try:
            return self.agent.invoke({
                "input": f"List all repositories for the user/organization {username}"
            })
        except Exception as e:
            return {"error": str(e)}

    def search_repositories(self, query: str) -> Dict[str, Any]:
        """
        Search for GitHub repositories.
        
        Args:
            query (str): Search query
            
        Returns:
            Dict[str, Any]: Search results
        """
        try:
            return self.agent.invoke({
                "input": f"Search for repositories matching the query: {query}"
            })
        except Exception as e:
            return {"error": str(e)}

# Example usage
if __name__ == "__main__":
    # Initialize the agent with your GitHub token
    github_token = os.getenv("GITHUB_TOKEN")
    if not github_token:
        raise ValueError("GITHUB_TOKEN environment variable is required")
    
    agent = GitHubMCPAgent(github_token)
    
    # Example: Get file contents
    result = agent.get_file_contents(
        owner="example-owner",
        repo="example-repo",
        path="README.md"
    )
    print(result) 