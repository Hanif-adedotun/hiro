import streamlit as st
import os
import requests
from dotenv import load_dotenv
import json
from datetime import datetime

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
        
        google_api_key = st.text_input(
            "Google API Key (Optional)",
            type="password",
            help="Enter your Google API key if using Google services"
        )
        
        # Save configuration
        if st.button("💾 Save Configuration"):
            save_configuration(github_token, groq_api_key, google_api_key)
    
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
    
    with col2:
        if st.button("🔍 Validate Repository", type="primary"):
            if validate_repository(repo_url, github_token):
                st.success("✅ Repository is accessible")
            else:
                st.error("❌ Repository not accessible or invalid URL")
    
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
            include_docs = st.checkbox(
                "Generate Documentation",
                value=True,
                help="Also generate requirement documentation"
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
        if st.button("🚀 Generate Tests", type="primary", use_container_width=True):
            if not groq_api_key:
                st.error("❌ GROQ API key is required for test generation")
                return
            
            with st.spinner("🤖 AI is analyzing your codebase and generating tests..."):
                result = generate_tests(
                    repo_url, 
                    github_token, 
                    groq_api_key,
                    test_framework,
                    test_coverage,
                    include_docs,
                    max_tests_per_file,
                    include_edge_cases,
                    test_timeout,
                    parallel_tests
                )
                
                if result.get("success"):
                    display_results(result)
                else:
                    st.error(f"❌ Error generating tests: {result.get('error', 'Unknown error')}")
    
    # Recent activity
    st.header("📊 Recent Activity")
    display_recent_activity()

def save_configuration(github_token, groq_api_key, google_api_key):
    """Save configuration to session state"""
    st.session_state.github_token = github_token
    st.session_state.groq_api_key = groq_api_key
    st.session_state.google_api_key = google_api_key
    
    # Save to .env file
    env_content = f"""# Hiro Configuration
GITHUB_PERSONAL_ACCESS_TOKEN={github_token}
GROQ_API_KEY={groq_api_key}
GOOGLE_API_KEY={google_api_key}
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
        return response.status_code == 200
    
    except Exception:
        return False

def generate_tests(repo_url, github_token, groq_api_key, test_framework, test_coverage, 
                  include_docs, max_tests_per_file, include_edge_cases, test_timeout, parallel_tests):
    """Generate tests using the Hiro backend"""
    try:
        # This would call your existing backend API
        # For now, we'll simulate the process
        
        # Extract repository info
        parts = repo_url.strip("/").split("/")
        owner = parts[-2]
        repo = parts[-1]
        
        # Simulate API call to your backend
        payload = {
            "repo_url": repo_url,
            "github_token": github_token,
            "groq_api_key": groq_api_key,
            "test_framework": test_framework,
            "test_coverage": test_coverage,
            "include_docs": include_docs,
            "max_tests_per_file": max_tests_per_file,
            "include_edge_cases": include_edge_cases,
            "test_timeout": test_timeout,
            "parallel_tests": parallel_tests
        }
        
        # In a real implementation, you would call your backend API here
        # response = requests.post("http://localhost:8000/generate-tests", json=payload)
        
        # For now, return a simulated response
        return {
            "success": True,
            "repository": f"{owner}/{repo}",
            "files_processed": 5,
            "tests_generated": 15,
            "test_files": [
                "test_main.py",
                "test_utils.py", 
                "test_api.py",
                "test_database.py",
                "test_auth.py"
            ],
            "coverage_percentage": 85,
            "execution_time": "2m 30s",
            "branch_created": "hiro-tests-2024-01-15",
            "pull_request_url": f"https://github.com/{owner}/{repo}/pull/123"
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
        st.metric("Coverage", f"{result['coverage_percentage']}%")
    
    with col4:
        st.metric("Execution Time", result["execution_time"])
    
    # Test files
    st.subheader("📄 Generated Test Files")
    for test_file in result["test_files"]:
        st.markdown(f"• `{test_file}`")
    
    # Actions
    st.subheader("🚀 Next Steps")
    
    col1, col2 = st.columns(2)
    
    with col1:
        if st.button("🔍 View Generated Tests", use_container_width=True):
            st.info("This would open the GitHub repository with the generated tests")
    
    with col2:
        if st.button("📊 View Coverage Report", use_container_width=True):
            st.info("This would show a detailed coverage report")
    
    # GitHub integration
    st.markdown(f"""
    <div class="success-message">
        <h4>✅ GitHub Integration Complete</h4>
        <p><strong>Branch created:</strong> <code>{result['branch_created']}</code></p>
        <p><strong>Pull Request:</strong> <a href="{result['pull_request_url']}" target="_blank">View Pull Request</a></p>
    </div>
    """, unsafe_allow_html=True)

def display_recent_activity():
    """Display recent test generation activity"""
    # This would typically load from a database
    # For now, we'll show sample data
    
    activities = [
        {
            "repository": "user/project-a",
            "tests_generated": 12,
            "coverage": 78,
            "timestamp": "2024-01-15 14:30",
            "status": "completed"
        },
        {
            "repository": "user/project-b", 
            "tests_generated": 8,
            "coverage": 92,
            "timestamp": "2024-01-15 12:15",
            "status": "completed"
        },
        {
            "repository": "user/project-c",
            "tests_generated": 0,
            "coverage": 0,
            "timestamp": "2024-01-15 10:45",
            "status": "failed"
        }
    ]
    
    for activity in activities:
        with st.container():
            col1, col2, col3, col4 = st.columns([2, 1, 1, 1])
            
            with col1:
                st.write(f"**{activity['repository']}**")
                st.caption(activity['timestamp'])
            
            with col2:
                st.write(f"{activity['tests_generated']} tests")
            
            with col3:
                st.write(f"{activity['coverage']}% coverage")
            
            with col4:
                if activity['status'] == 'completed':
                    st.success("✅")
                else:
                    st.error("❌")
            
            st.divider()

if __name__ == "__main__":
    main() 