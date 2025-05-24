import os
from openai import OpenAI

XAI_API_KEY = os.getenv("XAI_API_KEY")
    
client = OpenAI(
  api_key=XAI_API_KEY,
  base_url="https://api.x.ai/v1",
)

completion = client.chat.completions.create(
  model="grok-3-beta",
  messages=[
    {"role": "user", "content": "What is the meaning of life?"}
  ]
)