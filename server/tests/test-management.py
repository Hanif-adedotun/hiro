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

    def get_file_language(self, file_path: Path):
        ext = file_path.suffix.lower()
        return self.TEST_FRAMEWORKS.get(ext)

    def create_test_file_path(self, original_file: Path):
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

    def generate_test_template(self, file_path: Path, language: str):
        """Generate appropriate test template based on the language."""
        if language == 'jest':
            return self._generate_jest_template(file_path)
        elif language == 'pytest':
            return self._generate_pytest_template(file_path)
        # Add more templates for other languages as needed
        return ""

    def _generate_jest_template(self, file_path: Path):
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