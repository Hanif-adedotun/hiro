# {'owner': 'Hanif-adedotun', 'repo': 'semra-website'}\
     
# file path
# src/app/_components/(landing)/(prayers)/prayers.tsx
# src/app/contact/page.tsx
# src/app/articles/page.tsx
# src/app/articles/[id]/page.tsx
from  githubapi import  get_repo_tree, create_branch, get_file_content
from model import model, generate_code, ResponseFormatter
import os
from dotenv import load_dotenv
load_dotenv('.env')

async def main():
   
     """
          Test out model generating test cases
          
          Steps 1: Repo url
          Steps 2: Get the tree structure
          Steps 3: Get the full repo structure
          Steps 4: Get the file structure
          Steps 5: Send data to model to get unit tests
          Steps 6: Need three things from model  
                    -> path to put the test file, 
                    -> how to run the test file - language dependent 
     """     
     llm = await model()
      
     repo_url = "https://github.com/Hanif-adedotun/semra-website"
     
     # Get and print the tree structure
     tree_data = get_repo_tree(repo_url)
     print("\nAcquired repository tree structure:")
     
     
     # Get the full context from the file
     with open('server/semra-website.txt', 'r') as f:
         full_content = f.read()
     print("\nAcquired full context of repository tree structure:")
         
     # Get file content to generate unit test
     path = "src/app/_components/(landing)/(prayers)/prayers.tsx"
     file_ext = path.split(".")[-1]
     file_content = get_file_content(repo_url, f"{path}")
     
     user_prompt = "Generate a test function for this file"
    
     generated_code = await generate_code(llm, str(tree_data), full_content, file_content, user_prompt)
     
     response = generated_code.tool_calls[0]["args"]
     
    #  print("Generated Code:", response['code'])
     print("\nMetadata:", response['metadata'])
     print("\nRequired Packages:", response['packages'])
     
     # Create test file with appropriate extension
     test_file_name = f"test_{path.split('/')[-1].split('.')[0]}.{file_ext}"
     test_file_path = os.path.join('server/hiro-tests', test_file_name)
     
     # Create tests directory if it doesn't exist
     os.makedirs('server/hiro-tests', exist_ok=True)
     
     # Write generated test code to file
     with open(test_file_path, 'w') as f:
         f.write(response['code'])
     
     print(f"Test file created at: {test_file_path}")
     
     create_branch("https://github.com/Hanif-adedotun/semra-website", "hiro-tests")
     

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
            
     
     
     
