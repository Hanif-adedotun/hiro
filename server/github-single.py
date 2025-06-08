# {'owner': 'Hanif-adedotun', 'repo': 'semra-website'}\
     
# file path
# src/app/_components/(landing)/(prayers)/prayers.tsx
# src/app/contact/page.tsx
# src/app/articles/page.tsx
# src/app/articles/[id]/page.tsx
from  githubapi import  get_repo_tree, print_tree_structure, get_file_content
from model import model, generate_code
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
     print("\nRepository Tree Structure:")
     tree_data = get_repo_tree(repo_url)
     print_tree_structure(tree_data)
     
     
     # Get the full context from the file
     with open('server/semra-website.txt', 'r') as f:
         full_content = f.read()
         
     # Get file content to generate unit test
     path = "src/app/_components/(landing)/(prayers)/prayers.tsx"
     file_content = get_file_content(repo_url, f"{path}")
     
     user_prompt = "Generate a test function for this file"
    
     generated_code = await generate_code(llm, str(tree_data), full_content, file_content, user_prompt)
     print(generated_code)
     

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
            
     
     
     
