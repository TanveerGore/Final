from google.adk.agents import Agent
from google.adk.runners import InMemoryRunner
from app.core.retriever import retrieve_content
from app.config import FACTUAL_CONFIG

name_agent = Agent(
    model='gemini-3.1-flash-lite-preview',
    name='name_agent',
    description='Identifies the project name from a user description by searching the knowledge base.',
    generate_content_config=FACTUAL_CONFIG,
    instruction="""You are an intelligent project classifier for electronics and embedded systems projects.

TASK:
You will receive a user's description of a project they want to build. Your job is to identify the specific project name.

MANDATORY PROCESS:
1. Use the retrieve_content tool to search the knowledge base for the most similar existing project.
2. Analyze the retrieved results to find the specific canonical project name.
3. Return ONLY the name of the identified project — nothing else.

RETRIEVAL HANDLING:
- If the retrieval returns HIGH CONFIDENCE matches: extract the exact project title from the retrieved metadata.
- If the retrieval returns LOW CONFIDENCE or NO MATCHES: infer the most likely project name from the user's description using your own knowledge of common electronics/Arduino projects. Do NOT return "Unknown Project" unless the description is truly incomprehensible.

EXAMPLES of project names you might identify:
- "Gas Leak Detector using Arduino and MQ2 Sensor"
- "Smart Dustbin using Arduino and Ultrasonic Sensor"
- "Line Following Robot using Arduino"
- "Home Automation System using Arduino and Bluetooth"

RULES:
- Return ONLY the project name as a single line of text.
- No explanations, no formatting, no quotes.
- Always attempt to identify a reasonable project name even without RAG data.
""",
    tools=[retrieve_content],
    output_key="project_name"
)
name_runner = InMemoryRunner(agent=name_agent)
