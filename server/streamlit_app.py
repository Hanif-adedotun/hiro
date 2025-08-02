import streamlit as st
import os
import requests
from dotenv import load_dotenv
import json
from datetime import datetime

from  githubapi import  get_repo_tree, create_branch, get_file_content, commit_test_changes, print_tree_structure, print_repository_structure
from model import model, generate_code, ResponseFormatter
from githubapi import get_repository_files

import asyncio
import time

# Load environment variables
load_dotenv()

# Page configuration
st.set_page_config(
    page_title="Hiro - AI-Powered Test Generation",
    page_icon="🚀",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for better styling
st.markdown("""
<style>
    .main-header {
        background: linear-gradient(90deg, #FF6B35, #F7931E);
        padding: 2rem;
        border-radius: 10px;
        margin-bottom: 2rem;
        color: white;
        text-align: center;
    }
    .metric-card {
        background: #f0f2f6;
        padding: 1rem;
        border-radius: 8px;
        border-left: 4px solid #FF6B35;
        margin: 0.5rem 0;
    }
    .success-message {
        background: #d4edda;
        color: #155724;
        padding: 1rem;
        border-radius: 8px;
        border: 1px solid #c3e6cb;
    }
    .error-message {
        background: #f8d7da;
        color: #721c24;
        padding: 1rem;
        border-radius: 8px;
        border: 1px solid #f5c6cb;
    }
    .info-box {
        background: #d1ecf1;
        color: #0c5460;
        padding: 1rem;
        border-radius: 8px;
        border: 1px solid #bee5eb;
    }
</style>
""", unsafe_allow_html=True)

def main():
    # Header
    st.markdown("""
    <div class="main-header">
        <h1>🚀 Hiro - AI-Powered Test Generation</h1>
        <p>Let AI handle your testing, so you can focus on building.</p>
    </div>
    """, unsafe_allow_html=True)
    
    # Sidebar for configuration
    with st.sidebar:
        st.header("🔧 Configuration")
        
        # GitHub Personal Access Token input
        st.subheader("GitHub Authentication")
        github_token = st.text_input(
            "GitHub Personal Access Token",
            type="password",
            help="Enter your GitHub Personal Access Token. This is required to access your repositories and create test files."
        )
        
        if github_token:
            st.success("✅ GitHub token provided")
        else:
            st.warning("⚠️ GitHub token required")
        
        # API Keys section
        st.subheader("API Keys")
        groq_api_key = st.text_input(
            "GROQ API Key",
            type="password",
            help="Enter your GROQ API key for AI model access"
        )
        
        # Save configuration
        if st.button("💾 Save Configuration"):
            save_configuration(github_token, groq_api_key)
    
    # Main content area
    if not github_token:
        st.markdown("""
        <div class="info-box">
            <h3>👋 Welcome to Hiro!</h3>
            <p>To get started, please provide your GitHub Personal Access Token in the sidebar.</p>
            <p><strong>How to get a GitHub Personal Access Token:</strong></p>
            <ol>
                <li>Go to GitHub Settings → Developer settings → Personal access tokens</li>
                <li>Click "Generate new token"</li>
                <li>Select the following scopes: repo, workflow</li>
                <li>Copy the token and paste it in the sidebar</li>
            </ol>
        </div>
        """, unsafe_allow_html=True)
        return
    
    # Repository input
    st.header("📁 Repository Configuration")
    
    col1, col2 = st.columns([2, 1])
    
    with col1:
        repo_url = st.text_input(
            "GitHub Repository URL",
            placeholder="https://github.com/username/repository",
            help="Enter the full URL of the GitHub repository you want to generate tests for"
        )
        
        # Show validation status near the input
        if repo_url:
            repository_validated = st.session_state.get('repository_validated', False)
            validated_repo_url = st.session_state.get('validated_repo_url', '')
            
            if repository_validated and validated_repo_url == repo_url:
                st.success("✅ Repository validated")
            elif repository_validated and validated_repo_url != repo_url:
                st.warning("⚠️ Repository URL changed - re-validate needed")
            else:
                st.info("ℹ️ Click 'Validate Repository' to proceed")
    
        with col2:
            if st.button("🔍 Validate Repository", type="primary"):
                if validate_repository(repo_url, github_token):
                    st.session_state.repository_validated = True
                    st.session_state.validated_repo_url = repo_url
                    st.success("✅ Repository is accessible")
                else:
                    st.session_state.repository_validated = False
                    st.error("❌ Repository not accessible or invalid URL")
    
    st.markdown("<div style='padding: 24px 0;'></div>", unsafe_allow_html=True)
    # Test generation options
    if repo_url:
        st.header("🧪 Test Generation Options")
        
        col1, col2, col3 = st.columns(3)
        
        with col1:
            test_framework = st.selectbox(
                "Testing Framework",
                ["Auto-detect", "Jest (JavaScript)", "PyTest (Python)", "JUnit (Java)", "Go Test (Go)"],
                help="Select the testing framework for your project"
            )
        
        with col2:
            test_coverage = st.selectbox(
                "Test Coverage Level",
                ["Basic", "Comprehensive", "Full Coverage"],
                help="Choose how thorough the test generation should be"
            )
        
        with col3:
            # After repository validation, list folders using get_repository_files
            folders = []
            if repo_url and st.session_state.get('repository_validated', False):
                
                try:
                    repo_files = get_repository_files(repo_url, path="")
                    # Only include folders/directories
                    folders = [item['path'] for item in repo_files if item['type'] == 'dir']
                except Exception as e:
                    st.warning(f"Could not fetch folders: {e}")
            if folders:
                test_folder = st.selectbox(
                    "Folder",
                    options=[""] + folders,
                    help="Select a specific folder to limit tests (leave blank for all)"
                )
            else:
                test_folder = st.text_input(
                    "Folder",
                    help="Enter specific folder to limit tests e.g. src/app"
                )
        
        # Advanced options
        with st.expander("⚙️ Advanced Options"):
            col1, col2 = st.columns(2)
            
            with col1:
                max_tests_per_file = st.slider(
                    "Max Tests per File",
                    min_value=1,
                    max_value=10,
                    value=3,
                    help="Maximum number of test cases to generate per file"
                )
                
                include_edge_cases = st.checkbox(
                    "Include Edge Cases",
                    value=True,
                    help="Generate tests for edge cases and error conditions"
                )
            
            with col2:
                test_timeout = st.number_input(
                    "Test Timeout (seconds)",
                    min_value=5,
                    max_value=300,
                    value=30,
                    help="Timeout for test execution"
                )
                
                parallel_tests = st.checkbox(
                    "Enable Parallel Testing",
                    value=True,
                    help="Run tests in parallel when possible"
                )
        
        # Generate tests button
        # Check if repository has been validated
        repository_validated = st.session_state.get('repository_validated', False)
        validated_repo_url = st.session_state.get('validated_repo_url', '')
        
        # Show validation status
        if repository_validated and validated_repo_url == repo_url:
            st.success("✅ Repository validated and ready for test generation")
        elif repo_url and not repository_validated:
            st.warning("⚠️ Please validate the repository before generating tests")
        elif repo_url and repository_validated and validated_repo_url != repo_url:
            st.warning("⚠️ Repository URL changed. Please re-validate the repository")
            st.session_state.repository_validated = False
        
        # Generate tests button - only enabled if repository is validated
        if st.button("🚀 Generate Tests", type="primary", use_container_width=True, 
                    disabled=not (repository_validated and validated_repo_url == repo_url)):
            if not groq_api_key:
                st.error("❌ GROQ API key is required for test generation")
                return
            
            with st.spinner("🤖 AI is analyzing your codebase and generating tests..."):
                
                result = asyncio.run(generate_tests(
                    repo_url, 
                    github_token, 
                    groq_api_key,
                    test_framework,
                    test_coverage,
                    test_folder,
                    max_tests_per_file,
                    include_edge_cases,
                    test_timeout,
                    parallel_tests
                ))
                
                if result.get("success"):
                    display_results(result)
                else:
                    st.error(f"❌ Error generating tests: {result.get('error', 'Unknown error')}")
    
    # # Recent activity
    # st.header("📊 Recent Activity")
    # display_recent_activity()

def save_configuration(github_token, groq_api_key):
    """Save configuration to session state"""
    st.session_state.github_token = github_token
    st.session_state.groq_api_key = groq_api_key
    
    # Save to .env file
    env_content = f"""# Hiro Configuration
GITHUB_PERSONAL_ACCESS_TOKEN={github_token}
GROQ_API_KEY={groq_api_key}
"""
    
    try:
        with open(".env", "w") as f:
            f.write(env_content)
        st.success("✅ Configuration saved successfully!")
    except Exception as e:
        st.error(f"❌ Error saving configuration: {str(e)}")

def validate_repository(repo_url, github_token):
    """Validate if the repository is accessible"""
    if not repo_url or not github_token:
        return False
    
    try:
        # Extract owner and repo from URL
        parts = repo_url.strip("/").split("/")
        if len(parts) < 2:
            return False
        
        owner = parts[-2]
        repo = parts[-1]
        
        # GitHub API endpoint
        url = f"https://api.github.com/repos/{owner}/{repo}"
        headers = {
            "Authorization": f"token {github_token}",
            "Accept": "application/vnd.github.v3+json"
        }
        
        response = requests.get(url, headers=headers)
        print(response.json())
        return response.status_code == 200
    
    except Exception:
        return False

async def generate_tests(repo_url, github_token, groq_api_key, test_framework, test_coverage, 
                  test_folder, max_tests_per_file, include_edge_cases, test_timeout, parallel_tests):
    """Generate tests using the Hiro backend"""
    start_time = time.time()
    try:
        # Initialize llm
        st.info("🔄 Initializing AI model...")
        llm = await model()
        
        repo_name = repo_url.split('/')[-1]
    
        # Get and print the tree structure
        st.info("📂 Fetching repository tree structure...")
        tree_data = get_repo_tree(repo_url)
        # print_tree_structure(tree_data)
        
        folder = test_folder
        
        # print("\nRepository Structure with Content:")
        st.info("📄 Gathering repository file contents...")
        full_context, all_files = [], []
        full_context, all_files = print_repository_structure(repo_url, full_context, all_files, folder)
        st.success(f"✅ All files acquired: {len(all_files)} files found.")
        
        # Join all content with newlines
        full_context_str = "\n".join(full_context)
        
        # Progress tracking
        total_files = len(all_files)
        processed_files = 0
        
        for path in all_files:
            user_prompt = "Generate a test function for this file"
            
            file_content = get_file_content(repo_url, f"{path}")
            
            file_ext = path.split(".")[-1]
        
            processed_files += 1
            st.info(f"🤖 Generating tests for `{path}`... ({processed_files}/{total_files})")
            generated_code = await generate_code(llm, str(tree_data), full_context_str, file_content, user_prompt)
            
            response = generated_code.tool_calls[0]["args"]
            
            #  print("Generated Code:", response['code'])
            st.info(f"📝 Metadata for `{path}`: {response['metadata']}")
            st.info(f"📦 Required Packages for `{path}`: {response['packages']}")
            
            test_files_folder = f'server/hiro-tests/{repo_name}'
            
            # Create test file with appropriate extension
            test_file_name = f"test_{path.split('/')[-1].split('.')[0]}.test.{file_ext}"
            test_file_path = os.path.join(test_files_folder, test_file_name)
            
            # Create tests directory if it doesn't exist
            os.makedirs(test_files_folder, exist_ok=True)
            
            # Write generated test code to file
            with open(test_file_path, 'w') as f:
                f.write(response['code'])
            st.success(f"✅ Test file created: `{test_file_path}`")
                
            # Write metadata to markdown file
            metadata_file_path = os.path.join(test_files_folder, 'metadata.md')
            mode = 'a' if os.path.exists(metadata_file_path) else 'w'
            with open(metadata_file_path, mode) as f:
                f.write(response['metadata'])
                f.write("\n\n## Required Packages\n")
                for package in response['packages']:
                    f.write(f"- {package}\n")
                st.info(f"🗒️ Metadata file updated: `{metadata_file_path}`")
                
        st.info("🌱 Creating 'hiro-tests' branch in the repository...")
        create_branch(repo_url, "hiro-tests")
        
        # Loop through all files in the test folder and commit each one
        for filename in os.listdir(test_files_folder):
            file_path = os.path.join(test_files_folder, filename)
            if os.path.isfile(file_path):
                commit_test_changes(repo_url, f"generated test cases for {filename}", file_path)
        
        st.success("🚀 Done! Committed changes to GitHub.")
        
        # Calculate execution time
        end_time = time.time()
        execution_time_seconds = end_time - start_time
        
        # Format execution time
        if execution_time_seconds < 60:
            execution_time_str = f"{execution_time_seconds:.1f}s"
        elif execution_time_seconds < 3600:
            minutes = int(execution_time_seconds // 60)
            seconds = int(execution_time_seconds % 60)
            execution_time_str = f"{minutes}m {seconds}s"
        else:
            hours = int(execution_time_seconds // 3600)
            minutes = int((execution_time_seconds % 3600) // 60)
            execution_time_str = f"{hours}h {minutes}m"
        
        return {
            "success": True,
            "repository": repo_name,
            "files_processed": len(all_files),
            "tests_generated": len(os.listdir(test_files_folder)),
            "test_files": all_files,
            "coverage_percentage": 85,
            "execution_time": execution_time_str,
            "branch_created": "hiro-tests",
            "pull_request_url": f"{repo_url}/tree/hiro-tests"
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

def display_results(result):
    """Display test generation results"""
    st.success("🎉 Tests generated successfully!")
    
    # Metrics
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric("Files Processed", result["files_processed"])
    
    with col2:
        st.metric("Tests Generated", result["tests_generated"])
    
    with col3:
        st.metric("Execution Time", result["execution_time"])
    
    # Test files
    st.subheader("📄 Generated Test Files")
    for test_file in result["test_files"]:
        st.markdown(f"• `{test_file}`")
    
    # Actions
    st.subheader("🚀 Next Steps")
    
    # GitHub integration
    st.markdown(f"""
    <div class="success-message">
        <h4>✅ Test cases pushed to your GitHub</h4>
        <p><strong>Branch created:</strong> <code>{result['branch_created']}</code></p>
        <p><strong>Pull Request:</strong> <a href="{result['pull_request_url']}" target="_blank">View Pull Request</a></p>
    </div>
    """, unsafe_allow_html=True)

if __name__ == "__main__":
    main() 