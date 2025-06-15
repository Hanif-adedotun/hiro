from  githubapi import  get_repo_tree, create_branch, get_file_content, commit_test_changes, print_tree_structure, print_repository_structure
from model import model, generate_code, ResponseFormatter
import os
from dotenv import load_dotenv
load_dotenv('.env')

async def main():
    # Initialize llm
    llm = await model()
     
    # Example usage
    # repo_url = "https://github.com/Hanif-adedotun/semra-website"
    repo_url = "https://github.com/Hanif-adedotun/ecommerce-golang"
    repo_name = repo_url.split('/')[-1]
    
    # Get and print the tree structure
    print("\nRepository Tree Structure:")
    tree_data = get_repo_tree(repo_url)
    print_tree_structure(tree_data)
    
    # folder = "src/app"
    folder = ""
    
    # print("\nRepository Structure with Content:")
    full_context, all_files = [], []
    full_context,all_files = print_repository_structure(repo_url, full_context,all_files, folder)
    print("\nAll files Acquired:")
    print(all_files)
    
    # Join all content with newlines
    full_context_str = "\n".join(full_context)
    
    for path in all_files:
        user_prompt = "Generate a test function for this file"
        
        file_content = get_file_content(repo_url, f"{path}")
        
        file_ext = path.split(".")[-1]
    
        generated_code = await generate_code(llm, str(tree_data), full_context_str, file_content, user_prompt)
        
        response = generated_code.tool_calls[0]["args"]
        
        #  print("Generated Code:", response['code'])
        print("\nMetadata:", response['metadata'])
        print("\nRequired Packages:", response['packages'])
        
        test_files_folder = f'server/hiro-tests/{repo_name}'
        
        # Create test file with appropriate extension
        test_file_name = f"test_{path.split('/')[-1].split('.')[0]}.test.{file_ext}"
        test_file_path = os.path.join(test_files_folder, test_file_name)
        
        # Create tests directory if it doesn't exist
        os.makedirs(test_files_folder, exist_ok=True)
        
        # Write generated test code to file
        with open(test_file_path, 'w') as f:
            f.write(response['code'])
        print(f"Test file created at: {test_file_path}")
            
        # Write metadata to markdown file
        metadata_file_path = os.path.join(test_files_folder, 'metadata.md')
        mode = 'a' if os.path.exists(metadata_file_path) else 'w'
        with open(metadata_file_path, mode) as f:
            f.write(response['metadata'])
            f.write("\n\n## Required Packages\n")
            for package in response['packages']:
                f.write(f"- {package}\n")
            print(f"Metadata file added at: {metadata_file_path}")
            
    create_branch(repo_url, "hiro-tests")
     
     # Loop through all files in the test folder and commit each one
    for filename in os.listdir(test_files_folder):
         file_path = os.path.join(test_files_folder, filename)
         if os.path.isfile(file_path):
                 commit_test_changes(repo_url, f"generated test cases for {filename}", file_path)
     
    print(f"Done! Commited changes to github")
             
    
    # # Save the full context to a file
    # if full_context:
    #     output_dir = os.path.join(os.path.dirname(__file__), repo_name)
    #     os.makedirs(output_dir, exist_ok=True)
        
    #     output_file = os.path.join(output_dir, f'{repo_name}.txt')
    #     with open(output_file, 'w', encoding='utf-8') as f:
    #         f.write(full_context_str)
    #     print(f"Repository context saved to {output_file}")

if __name__ == "__main__":
     import asyncio
     asyncio.run(main())