import requests
from typing import Dict, List, Optional
from urllib.parse import urlparse
import os
from dotenv import load_dotenv
from pathlib import Path
import re

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

class TestGenerator:
    # Mapping of file extensions to their corresponding test frameworks
    TEST_FRAMEWORKS = {
        '.ts': 'jest',  # For TypeScript/JavaScript
        '.tsx': 'jest',
        '.js': 'jest',
        '.jsx': 'jest',
        '.py': 'pytest',
        '.java': 'junit',
        '.go': 'testing',
        '.rb': 'rspec',
    }
    
    # Mapping of file extensions to their corresponding test file extensions
    TEST_FILE_EXTENSIONS = {
        '.ts': '.test.ts',
        '.tsx': '.test.tsx',
        '.js': '.test.js',
        '.jsx': '.test.jsx',
        '.py': '_test.py',
        '.java': 'Test.java',
        '.go': '_test.go',
        '.rb': '_spec.rb',
    }

    def __init__(self, repo_path: str):
        self.repo_path = Path(repo_path)
        self.test_dir = self.repo_path / 'tests'
        self.test_dir.mkdir(exist_ok=True)

    def get_file_language(self, file_path: Path) -> Optional[str]:
        """Determine the programming language of a file based on its extension."""
        ext = file_path.suffix.lower()
        return self.TEST_FRAMEWORKS.get(ext)

    def create_test_file_path(self, original_file: Path) -> Path:
        """Create the appropriate test file path based on the original file."""
        ext = original_file.suffix.lower()
        test_ext = self.TEST_FILE_EXTENSIONS.get(ext)
        
        if not test_ext:
            return None

        # Create a test file path that mirrors the original file structure
        rel_path = original_file.relative_to(self.repo_path)
        test_path = self.test_dir / rel_path.parent / f"{rel_path.stem}{test_ext}"
        test_path.parent.mkdir(parents=True, exist_ok=True)
        
        return test_path

    def generate_test_template(self, file_path: Path, language: str) -> str:
        """Generate appropriate test template based on the language."""
        if language == 'jest':
            return self._generate_jest_template(file_path)
        elif language == 'pytest':
            return self._generate_pytest_template(file_path)
        # Add more templates for other languages as needed
        return ""

    def _generate_jest_template(self, file_path: Path) -> str:
        """Generate Jest test template for TypeScript/JavaScript files."""
        component_name = file_path.stem
        return f"""import {{ render, screen }} from '@testing-library/react';
import {component_name} from '../{file_path.relative_to(self.repo_path)}';

describe('{component_name}', () => {{
    it('should render successfully', () => {{
        render(<{component_name} />);
        // Add your test cases here
    }});
}});
"""

    def _generate_pytest_template(self, file_path: Path) -> str:
        """Generate Pytest template for Python files."""
        module_name = file_path.stem
        return f"""import pytest
from {module_name} import *

def test_{module_name}():
    # Add your test cases here
    pass
"""

    def process_repository(self):
        """Process all files in the repository and generate test files."""
        for root, _, files in os.walk(self.repo_path):
            for file in files:
                file_path = Path(root) / file
                
                # Skip test files and certain directories
                if 'test' in file_path.parts or 'node_modules' in file_path.parts:
                    continue
                
                language = self.get_file_language(file_path)
                if not language:
                    continue
                
                test_file_path = self.create_test_file_path(file_path)
                if not test_file_path:
                    continue
                
                # Generate and write test template
                test_content = self.generate_test_template(file_path, language)
                test_file_path.write_text(test_content)
                print(f"Created test file: {test_file_path}")

def main():
    # Example usage
    repo_path = "path/to/your/repo"
    generator = TestGenerator(repo_path)
    generator.process_repository()

if __name__ == "__main__":
    main()