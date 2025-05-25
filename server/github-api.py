import requests
from typing import Dict, List, Optional
from urllib.parse import urlparse
import os
from dotenv import load_dotenv

# Get GitHub token from environment variable
GITHUB_TOKEN = os.getenv('GITHUB_PERSONAL_ACCESS_TOKEN')

def get_repo_info_from_url(github_url: str) -> Dict[str, str]:
    """
    Extract repository owner and name from a GitHub URL.
    
    Args:
        github_url (str): The GitHub repository URL
        
    Returns:
        Dict[str, str]: Dictionary containing owner and repo name
    """
    
    parsed_url = urlparse(github_url)
    path_parts = parsed_url.path.strip('/').split('/')
    
    if len(path_parts) < 2:
        raise ValueError("Invalid GitHub URL. Expected format: https://github.com/owner/repo")
    
    return {
        'owner': path_parts[0],
        'repo': path_parts[1]
    }

def get_repository_files(github_url: str, path: str = '') -> List[Dict]:
    """
    Get files and directories from a GitHub repository.
    
    Args:
        github_url (str): The GitHub repository URL
        path (str): Optional path within the repository
        
    Returns:
        List[Dict]: List of files and directories with their information
    """
    repo_info = get_repo_info_from_url(github_url)
    
    api_url = f"https://api.github.com/repos/{repo_info['owner']}/{repo_info['repo']}/contents/{path}"
    
    headers = {'Authorization': f'token {GITHUB_TOKEN}'} if GITHUB_TOKEN else {}
    response = requests.get(api_url, headers=headers)
    response.raise_for_status()
    
    return response.json()

def print_repository_structure(github_url: str, path: str = '', indent: int = 0) -> None:
    """
    Recursively print the repository structure showing directories and files.
    
    Args:
        github_url (str): The GitHub repository URL
        path (str): Current path within the repository
        indent (int): Current indentation level
    """
    items = get_repository_files(github_url, path)
    
    for item in items:
        print(' ' * indent + '├── ' + item['name'])
        
        if item['type'] == 'dir':
            new_path = f"{path}/{item['name']}" if path else item['name']
            print_repository_structure(github_url, new_path, indent + 4)

def get_file_content(github_url: str, file_path: str) -> str:
    """
    Get the content of a specific file from a GitHub repository.
    
    Args:
        github_url (str): The GitHub repository URL
        file_path (str): Path to the file within the repository
        
    Returns:
        str: The content of the file
    """
    repo_info = get_repo_info_from_url(github_url)
    
    api_url = f"https://api.github.com/repos/{repo_info['owner']}/{repo_info['repo']}/contents/{file_path}"
    
    headers = {'Authorization': f'token {GITHUB_TOKEN}'} if GITHUB_TOKEN else {}
    response = requests.get(api_url, headers=headers)
    response.raise_for_status()
    
    file_data = response.json()
    
    if 'content' not in file_data:
        raise ValueError(f"Could not get content for file: {file_path}")
    
    import base64
    content = base64.b64decode(file_data['content']).decode('utf-8')
    return content


if __name__ == "__main__":
    # Example repository URL
    repo_url = "https://github.com/Hanif-adedotun/semra-website"
    
    print("Repository Structure:")
    print_repository_structure(repo_url)
    
    # Example of getting file content
    try:
        content = get_file_content(repo_url, "README.md")
        print("\nFile Content:")
        print(content)
    except Exception as e:
        print(f"Error getting file content: {e}")