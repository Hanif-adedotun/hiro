import requests
from typing import Dict, List, Optional
from urllib.parse import urlparse
import os
from dotenv import load_dotenv
from pathlib import Path
import re
import time

# Get GitHub token from environment variable
GITHUB_TOKEN = os.getenv('GITHUB_PERSONAL_ACCESS_TOKEN')

# Add a delay constant
API_DELAY = 1 

def get_repo_info_from_url(github_url: str):
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

def get_repository_files(github_url: str, path: str = ''):
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
    
    # Add delay after each API call
    time.sleep(API_DELAY)
    
    return response.json()

def print_repository_structure(github_url: str, path: str = '', indent: int = 0, target_folder : str = None):
    """
    Recursively print the repository structure showing directories and files.
    Also collects file contents into a text file.
    
    Args:
        github_url (str): The GitHub repository URL
        path (str): Current path within the repository
        indent (int): Current indentation level
        target_folder (str): The target folder to save content for
    """
    items = get_repository_files(github_url, path)
    all_content = []
    
    # Initialize output file if this is the target folder
    output_file = None
    if path == target_folder:
        repo_name = github_url.split('/')[-1]
        folder_name = target_folder.replace('/', '_') if target_folder else ''
        output_file = f"{repo_name}_{folder_name}.txt" if folder_name else f"{repo_name}.txt"
        
        # Get the absolute path for the output file
        output_path = os.path.join(os.getcwd(), output_file)
        print(f"\nSaving content to: {output_path}")
        
        # Create or clear the file
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write('')
    
    for item in items:
        print(' ' * indent + '├── ' + item['name'])
        
        if item['type'] == 'file':
            # Skip non-code files
            skip_extensions = {'.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.pdf', '.avif', '.lock', '.gitignore', '.env', '.yml', '.yaml'}
            if any(item['name'].lower().endswith(ext) for ext in skip_extensions):
                continue
                
            try:
                file_content = get_file_content(github_url, f"{path}/{item['name']}" if path else item['name'])
                content_to_write = f"\n=== File: {item['name']} ===\n{file_content}"
                all_content.append(content_to_write)
                
                # Write content immediately if this is the target folder
                if output_file:
                    output_path = os.path.join(os.getcwd(), output_file)
                    with open(output_path, 'a', encoding='utf-8') as f:
                        f.write(content_to_write)
                    print(f"Added content from: {item['name']}")
            except Exception as e:
                error_msg = f"\n=== Error reading file {item['name']}: {str(e)} ===\n"
                print(error_msg.strip())
                if output_file:
                    output_path = os.path.join(os.getcwd(), output_file)
                    with open(output_path, 'a', encoding='utf-8') as f:
                        f.write(error_msg)
        
        if item['type'] == 'dir':
            new_path = f"{path}/{item['name']}" if path else item['name']
            print_repository_structure(github_url, new_path, indent + 4, target_folder)
    
    # Print completion message if this is the target folder
    if path == target_folder:
        output_path = os.path.join(os.getcwd(), output_file)
        print(f"\nSuccessfully saved all content to: {output_path}")

def get_file_content(github_url: str, file_path: str):
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
    
    # Add delay after each API call
    time.sleep(API_DELAY)
    
    file_data = response.json()
    
    if 'content' not in file_data:
        raise ValueError(f"Could not get content for file: {file_path}")
    
    import base64
    content = base64.b64decode(file_data['content']).decode('utf-8')
    return content



# Plan 1
# Loop through all files, add all content to one big txt file to get context
#  Get test cases, max 3 for all files passed through create a Test Generation class, using a model
#  Create test files in file called hiro_tests at the top level
# Get context using txt file, to the model
# Determine if any extra configuration is needed, from model, like editing the packahe.json file to run tests

def main():
    # Example usage
    repo_url = "https://github.com/Hanif-adedotun/semra-website"
    
    folder = "src/app"
    
    print("Repository Structure:")
    print_repository_structure(repo_url, folder)

if __name__ == "__main__":
    main()