# Contributing to Hiro

Thank you for your interest in contributing to Hiro! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [About Hiro](#about-hiro)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Code Style Guidelines](#code-style-guidelines)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Reporting Bugs](#reporting-bugs)
- [Requesting Features](#requesting-features)
- [Code of Conduct](#code-of-conduct)

## About Hiro

Hiro is an AI-powered tool that automatically generates comprehensive unit tests and requirement documentation for any codebase. It's designed to be language-agnostic and integrates seamlessly with GitHub workflows.

### Key Features

- **Language Agnostic**: Works with any programming language or testing framework
- **Intelligent Test Generation**: Leverages AI to create comprehensive test cases
- **GitHub Integration**: Seamlessly integrates with GitHub MCP (Multiple Code Paths)
- **Automated GitHub Actions**: Creates and configures GitHub Actions for running tests
- **Continuous Testing**: Ensures your code is always tested with each change
- **Automated Documentation**: Generates detailed requirement documentation

## How Can I Contribute?

We welcome contributions in many forms:

### 🐛 Bug Reports

- Report bugs you encounter while using Hiro
- Provide detailed steps to reproduce the issue
- Include error messages and system information

### 💡 Feature Requests

- Suggest new features or improvements
- Describe the use case and expected behavior
- Consider the impact on existing functionality

### 🔧 Code Contributions

- Fix bugs and implement features
- Improve documentation
- Add tests and improve test coverage
- Optimize performance
- Enhance the user interface

### 📚 Documentation

- Improve existing documentation
- Add examples and tutorials
- Update README files
- Create guides for new features

## Development Setup

### Prerequisites

- **Node.js** (v18 or higher)
- **Python** (v3.8 or higher)
- **Git**
- **Yarn** (package manager)

### Installation

1. **Fork and clone the repository**

   ```bash
   git clone https://github.com/your-username/hiro.git
   cd hiro
   ```

2. **Set up the web application (Astro/React)**

   ```bash
   cd webapp
   yarn install
   ```

3. **Set up the Python server**

   ```bash
   cd ../server
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   pip install -r requirements.txt
   ```

4. **Environment Variables**

   Create a `.env` file in the `server` directory with the following variables:

   ```env
   # Required environment variables for Hiro server

   # GitHub Personal Access Token (required for GitHub API integration)
   GITHUB_PERSONAL_ACCESS_TOKEN=your_github_pat_here

   # GROQ API Key (required for AI model integration)
   GROQ_API_KEY=your_groq_api_key_here

   # Google API Key (if using Google services)
   GOOGLE_API_KEY=your_google_api_key_here
   ```

   > **Note:** You can find example values in `server/.env` (do not commit secrets).

   - `GITHUB_PERSONAL_ACCESS_TOKEN` is required for Hiro to interact with GitHub repositories and workflows.
   - `GROQ_API_KEY` is required for AI-powered test and documentation generation.
   - `GOOGLE_API_KEY` is required if you use Google-based features (optional).

### Running the Application

1. **Start the web application**

   ```bash
   cd webapp
   yarn dev
   ```

   The web app will be available at `http://localhost:4321`

2. **Start the Python server**

   ```bash
   cd server
   python app.py
   ```

   The API server will be available at `http://localhost:8000`

## Project Structure
