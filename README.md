<div align="center">

  <img src="static/logo-mini.png" alt="logo" width="50" height="auto" />
  <h1>Hiro</h1>
  
  <p>
   Let Hiro handle your testing and documentation, so you can focus on building.
  </p>

<!-- Badges -->
<p>
  <a href="https://github.com/hanif-adedotun/hiro/graphs/contributors">
    <img src="https://img.shields.io/github/contributors/hanif-adedotun/hiro" alt="contributors" />
  </a>
  <a href="">
    <img src="https://img.shields.io/github/last-commit/hanif-adedotun/hiro" alt="last update" />
  </a>
  <a href="https://github.com/hanif-adedotun/hiro/network/members">
    <img src="https://img.shields.io/github/forks/hanif-adedotun/hiro" alt="forks" />
  </a>
  <a href="https://github.com/hanif-adedotun/hiro/stargazers">
    <img src="https://img.shields.io/github/stars/hanif-adedotun/hiro" alt="stars" />
  </a>
  <a href="https://github.com/hanif-adedotun/hiro/issues/">
    <img src="https://img.shields.io/github/issues/hanif-adedotun/hiro" alt="open issues" />
  </a>
  <a href="https://github.com/hanif-adedotun/hiro/blob/master/LICENSE">
    <img src="https://img.shields.io/github/license/hanif-adedotun/hiro.svg" alt="license" />
  </a>
</p>
   
<h4>
    <a href="https://github.com/hanif-adedotun/hiro/">View Repository</a>
  <span> · </span>
    <a href="https://github.com/hanif-adedotun/hiro/issues/">Report Bug</a>
  <span> · </span>
    <a href="https://github.com/hanif-adedotun/hiro/issues/">Request Feature</a>
  </h4>
</div>

<br />

<!-- Table of Contents -->

# :notebook_with_decorative_cover: Table of Contents

- [About the Project](#star2-about-the-project)
  - [Tech Stack](#space_invader-tech-stack)
  - [Features](#dart-features)
  - [Color Reference](#art-color-reference)
  - [Environment Variables](#key-environment-variables)
- [Getting Started](#toolbox-getting-started)
  - [Prerequisites](#bangbang-prerequisites)
  - [Installation](#gear-installation)
  - [Run Locally](#running-run-locally)
- [Usage](#eyes-usage)
- [Roadmap](#compass-roadmap)
- [Contributing](#wave-contributing)
  - [Code of Conduct](#scroll-code-of-conduct)
- [License](#warning-license)
- [Contact](#handshake-contact)
- [Acknowledgements](#gem-acknowledgements)

<!-- About the Project -->

## :star2: About the Project

<div align="center"> 
  <img src="static/logo.png" alt="screenshot" />
</div>

<p>Hiro is an AI tool designed to automatically generate unit test cases and requirement documentation for your codebase, regardless of the programming language or framework you're using.</p>

### :space_invader: Tech Stack

- **Backend**: Python 3.x
- **AI/ML**: LangChain, Groq (Llama 3.3 70B), Google Generative AI
- **Web Framework**: Streamlit
- **GitHub Integration**: PyGithub, GitHub API
- **Environment Management**: python-dotenv
- **Testing**: pytest, debugpy
- **Dependencies**: See requirements.txt for complete list
<!-- Features -->

### :dart: Features

- **Language Agnostic**: Works with any programming language or testing framework
- **AI-Powered Test Generation**: Uses Groq's Llama 3.3 70B model to generate comprehensive test cases
- **GitHub Integration**: Direct integration with GitHub repositories via PyGithub
- **Repository Analysis**: Automatically analyzes repository structure and file contents
- **Automated Test File Creation**: Creates properly named test files in organized directories
- **Metadata Generation**: Generates detailed metadata and package requirements for each test
- **Streamlit Web Interface**: User-friendly web interface for easy interaction
- **Branch Management**: Automatically creates and manages test branches on GitHub
- **Multiple AI Models**: Supports Groq and Google Generative AI for flexible AI processing

### :dart: How it Works

1. **Repository Analysis**: Hiro connects to your GitHub repository and analyzes its file structure and contents
2. **Code Context Extraction**: The system extracts relevant code files, skipping binary and configuration files
3. **AI Processing**: The code is processed by Groq's Llama 3.3 70B model to understand functionality and generate appropriate test cases
4. **Test Generation**: AI generates up to 3 comprehensive test cases per file, following testing best practices
5. **Metadata Creation**: Each test includes metadata and required package information for easy setup
6. **GitHub Integration**: Tests are automatically committed to a new branch called `hiro-tests`  on your repository

<!-- Env Variables -->

### :key: Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`GITHUB_PERSONAL_ACCESS_TOKEN` - Your GitHub personal access token for repository access

`GROQ_API_KEY` - Your Groq API key for AI model access

`GOOGLE_API_KEY` - Your Google API key for additional AI services

<!-- Getting Started -->

## :toolbox: Getting Started

<!-- Prerequisites -->

### :bangbang: Prerequisites

This project requires Python 3.x and pip

- Python 3.7 or higher
- pip (Python package installer)
- Git (for GitHub integration)

<!-- Installation -->

### :gear: Installation

1. Clone the repository

```bash
  git clone https://github.com/hanif-adedotun/hiro.git
  cd hiro
```

2. Navigate to the server directory

```bash
  cd server
```

3. Create a virtual environment (recommended)

```bash
  python -m venv .venv
  source .venv/bin/activate 
```

4. Install dependencies

```bash
  pip install -r requirements.txt
```

5. Create a `.env` file in the server directory and add your API keys

```bash
  touch .env 
```

<!-- Run Locally -->

### :running: Run Locally

1. Make sure you're in the server directory and have activated your virtual environment

```bash
  cd server
  source .venv/bin/activate 
```

2. Ensure your `.env` file contains the required API keys

```bash
  GITHUB_PERSONAL_ACCESS_TOKEN=your_github_token
  GROQ_API_KEY=your_groq_api_key
  GOOGLE_API_KEY=your_google_api_key
```

3. Run the application

```bash
  python app.py
```

4. For the Streamlit web interface, run:

```bash
  streamlit run streamlit_app.py
```

The application will start and you can begin generating test cases for your repositories.

## :eyes: Usage

### Command Line Interface

1. Run the main application:
```bash
python app.py
```

2. Follow the prompts to provide your GitHub repository URL

3. The system will automatically:
   - Analyze your repository structure
   - Generate test cases for each relevant file
   - Create organized test files in a `hiro-tests` directory
   - Commit the tests to a new branch on your repository

### Web Interface

1. Start the Streamlit application:
```bash
streamlit run streamlit_app.py
```

2. Open your browser to the provided local URL (usually `http://localhost:8501`)

3. Use the web interface to:
   - Enter repository URLs
   - Monitor test generation progress
   - View generated test files and metadata
   - Manage your test generation workflow

<!-- Roadmap -->

## :compass: Roadmap

- [x] Basic GitHub repository integration
- [x] AI-powered test generation with Groq
- [x] Streamlit web interface
- [x] Automated test file creation and organization
- [x] GitHub branch management and commits
- [ ] Enhanced test coverage analysis
- [ ] Dashboard for test result reporting and analytics
- [ ] Integration with more AI models
- [ ] Automated documentation generation
- [ ] CI/CD pipeline integration

<!-- Contributing -->

## :wave: Contributing

<a href="https://github.com/hanif-adedotun/hanif-adedotun/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=hanif-adedotun/hiro" />
</a>

Contributions are always welcome!

See `contributing.md` for ways to get started.

<!-- License -->

## :warning: License

Distributed under the no License. See LICENSE.txt for more information.

<!-- Contact -->

## :handshake: Contact

Hanif - [@devhanif](https://x.com/devhanif) - hiro@hanif.one

Project Link: [https://github.com/hanif-adedotun/hiro](https://github.com/hanif-adedotun/hiro)
