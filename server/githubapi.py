import requests
from typing import Dict, List, Optional, Any
from urllib.parse import urlparse
import os
from dotenv import load_dotenv
from pathlib import Path
import re
import time
import base64
import json

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

def get_repo_tree(github_url: str, recursive: bool = True):
    """
    Get the complete tree structure of a GitHub repository.
    
    Args:
        github_url (str): The GitHub repository URL
        recursive (bool): Whether to get the complete tree recursively
        
    Returns:
        Dict[str, Any]: The tree structure of the repository
    """
    repo_info = get_repo_info_from_url(github_url)
    
    # First, get the default branch
    api_url = f"https://api.github.com/repos/{repo_info['owner']}/{repo_info['repo']}"
    headers = {'Authorization': f'token {GITHUB_TOKEN}'} if GITHUB_TOKEN else {}
    
    response = requests.get(api_url, headers=headers)
    response.raise_for_status()
    default_branch = response.json()['default_branch']
    
    # Get the tree
    api_url = f"https://api.github.com/repos/{repo_info['owner']}/{repo_info['repo']}/git/trees/{default_branch}"
    if recursive:
        api_url += "?recursive=1"
    
    response = requests.get(api_url, headers=headers)
    response.raise_for_status()
    
    # Add delay after each API call
    time.sleep(API_DELAY)
    
    return response.json()

def print_tree_structure(tree_data: Dict[str, Any], indent: int = 0):
    """
    Print the tree structure in a readable format.
    
    Args:
        tree_data (Dict[str, Any]): The tree data from GitHub API
        indent (int): Current indentation level
    """
    if 'tree' not in tree_data:
        return
    
    for item in tree_data['tree']:
        prefix = '├── ' if indent > 0 else ''
        print(' ' * indent + prefix + item['path'])
        
        # If it's a directory and we have recursive data, print its contents
        if item['type'] == 'tree' and 'children' in item:
            print_tree_structure({'tree': item['children']}, indent + 4)

def print_repository_structure(github_url: str, full_context: list, path: str = '', indent: int = 0, target_folder: str = None):
    """
    Recursively print the repository structure showing directories and files.
    Also collects file contents into a text file.
    
    Args:
        github_url (str): The GitHub repository URL
        full_context (list): List to store file contents
        path (str): Current path within the repository
        indent (int): Current indentation level
        target_folder (str): The target folder to save content for
        
    Returns:
        list: The updated full_context list
    """
    items = get_repository_files(github_url, path)
    all_content = []
    
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
                full_context.append(content_to_write)
                print(f"\nAdding context of {item['name']}: ")
                
                # # Write content immediately if this is the target folder
                # if output_file:
                #     output_path = os.path.join(os.getcwd(), output_file)
                #     with open(output_path, 'a', encoding='utf-8') as f:
                #         f.write(content_to_write)
                #     print(f"Added content from: {item['name']}")
            except Exception as e:
                error_msg = f"\n=== Error reading file {item['name']}: {str(e)} ===\n"
                # print(error_msg.strip())
                # if output_file:
                #     output_path = os.path.join(os.getcwd(), output_file)
                #     with open(output_path, 'a', encoding='utf-8') as f:
                #         f.write(error_msg)
        
        if item['type'] == 'dir':
            new_path = f"{path}/{item['name']}" if path else item['name']
            print_repository_structure(github_url, full_context, new_path, indent + 4, target_folder)
    
    # Print completion message if this is the target folder
    # if path == target_folder:
    #     output_path = os.path.join(os.getcwd(), output_file)
    #     print(f"\nSuccessfully saved all content to: {output_path}")
    return full_context

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
    
    
    content = base64.b64decode(file_data['content']).decode('utf-8')
    return content

def create_branch(github_url: str, branch_name: str):
    """
    Create a new branch in a GitHub repository using the GitHub API.
    
    Args:
        github_url (str): The GitHub repository URL
        branch_name (str): Name for the new branch
        
    Returns:
        str: A success or failure message indicating if the branch was created successfully
    """
    repo_info = get_repo_info_from_url(github_url)
    
    # Get the default branch's latest commit SHA
    refs_url = f"https://api.github.com/repos/{repo_info['owner']}/{repo_info['repo']}/git/refs/heads"
    headers = {'Authorization': f'token {GITHUB_TOKEN}'} if GITHUB_TOKEN else {}
    
    response = requests.get(refs_url, headers=headers)
    response.raise_for_status()
    
    # Add delay after API call
    time.sleep(API_DELAY)
    
    # Check if branch already exists
    existing_branches = response.json()
    if any(ref['ref'] == f'refs/heads/{branch_name}' for ref in existing_branches):
        return f"Branch '{branch_name}' already exists"
    
    # Get the SHA of the default branch (usually main or master)
    default_branch_sha = existing_branches[0]['object']['sha']
    
    # Create new branch
    create_branch_url = f"https://api.github.com/repos/{repo_info['owner']}/{repo_info['repo']}/git/refs"
    branch_data = {
        "ref": f"refs/heads/{branch_name}",
        "sha": default_branch_sha
    }
    
    response = requests.post(create_branch_url, headers=headers, json=branch_data)
    
    if response.status_code == 201:
        return f"Successfully created branch '{branch_name}'"
    else:
        return f"Failed to create branch: {response.json().get('message', 'Unknown error')}"
         
def commit_test_changes(github_url: str, commit_message: str, file_path: str):
    """
    Commit test file changes to GitHub repository in the hiro-tests folder
    
    Args:
        github_url (str): The GitHub repository URL
        commit_message (str): Message for the commit
        file_path (str): Path to the test file within the repository
        
    Returns:
        str: A success or failure message indicating if the commit was successful
    """
    repo_info = get_repo_info_from_url(github_url)
    
    # Get just the filename from the path
    filename = os.path.basename(file_path)
    
    # Construct API URL for the file in hiro-tests folder
    api_url = f"https://api.github.com/repos/{repo_info['owner']}/{repo_info['repo']}/contents/hiro-tests/{filename}"
    
    # Read and encode file content
    with open(file_path, 'rb') as f:
        base64content = base64.b64encode(f.read())
    
    # Get current file data to obtain SHA
    headers = {'Authorization': f'token {GITHUB_TOKEN}'} if GITHUB_TOKEN else {}
    response = requests.get(f"{api_url}?ref=hiro-tests", headers=headers)
    
    if response.status_code == 404:
        # File doesn't exist yet, create new file
        data = {
            "message": commit_message,
            "branch": "hiro-tests",
            "content": base64content.decode('utf-8')
        }
    else:
        # Update existing file
        current_data = response.json()
        data = {
            "message": commit_message,
            "branch": "hiro-tests",
            "content": base64content.decode('utf-8'),
            "sha": current_data['sha']
        }
    
    # Commit changes
    response = requests.put(
        api_url,
        headers={"Content-Type": "application/json", "Authorization": f"token {GITHUB_TOKEN}"},
        json=data
    )
    
    # Add delay after API call
    time.sleep(API_DELAY)
    
    if response.status_code in [200, 201]:
        return f"Successfully committed changes to hiro-tests/{filename}"
    else:
        return f"Failed to commit changes: {response.json().get('message', 'Unknown error')}"
         
def create_pull_request(github_url: str, file_path: str):
    """
    Create a pull request from file changes
    
    Args:
        github_url (str): The GitHub repository URL
        file_path (str): Path to the file within the repository
        
    Returns:
        str: A success or failure message if the pull request was successfull
    """

         
def main():
    # Example usage
    repo_url = "https://github.com/Hanif-adedotun/semra-website"
    repo_name = repo_url.split('/')[-1]
    
    # Get and print the tree structure
    print("\nRepository Tree Structure:")
    tree_data = get_repo_tree(repo_url)
    print_tree_structure(tree_data)
    
    folder = "src/app"
    
    print("\nRepository Structure with Content:")
    full_context = []
    full_context = print_repository_structure(repo_url, full_context, folder)
    
    # Join all content with newlines
    full_context_str = "\n".join(full_context)
    print(full_context_str)
    
    # Save the full context to a file
    if full_context:
        output_dir = os.path.join(os.path.dirname(__file__), repo_name)
        os.makedirs(output_dir, exist_ok=True)
        
        output_file = os.path.join(output_dir, f'{repo_name}.txt')
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(full_context_str)
        print(f"Repository context saved to {output_file}")

if __name__ == "__main__":
    main()
    # create_branch("https://github.com/Hanif-adedotun/semra-website", "hiro-tests")
    # commit_test_changes("https://github.com/Hanif-adedotun/semra-website", "generated test cases", "hiro-tests/test_prayers.tsx")