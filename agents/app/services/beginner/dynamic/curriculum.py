from google.adk.agents import Agent
from google.adk.models.google_llm import Gemini
from app.config import JSON_GENERATION_CONFIG
from app.core.utils import retry_config
from app.core.retriever import retrieve_content

curriculum_agent = Agent(
    model = Gemini(
        model="gemini-3.1-flash-lite-preview",
        retry_config=retry_config,
        generation_config=JSON_GENERATION_CONFIG,
    ),
    name = "curriculum_designer",
    description = "Generates a technically grounded, project-specific learning roadmap for electronics/embedded systems projects.",
    instruction = """You are designing a project-specific learning curriculum for an electronics/embedded systems project.

You have access to retrieve_content to fetch technical details about the project from the knowledge base.

MANDATORY WORKFLOW:
1. Call retrieve_content with the project topic to gather component, interface, and system behavior data.
2. Check the confidence header:
   - HIGH CONFIDENCE → Build curriculum around confirmed hardware and interfaces.
   - MEDIUM/LOW CONFIDENCE → Use as hints, supplement with domain knowledge.
   - NO MATCHES / ERROR → Generate entirely from domain knowledge. Produce complete output regardless.

CURRICULUM DESIGN:
- 4-5 modules in sequential progression: hardware understanding → interfacing → system integration → validation
- Every module should directly prepare the student for building and debugging their specific project
- Include practical verification milestones after each module

EACH MODULE MUST INCLUDE:
- Title: specific to the project hardware and concepts
- Subtitle: secondary techniques or components covered
- Learning goals: measurable competencies with specific technical criteria
- Key topics: specific interfaces, components, protocols, and measurement techniques
- Learning approach: circuit construction, measurement, debugging exercises
- Assessment approach: practical verification methods

OUTPUT FORMAT:
- Valid JSON only — no markdown, no commentary, no code blocks
- Frontend-friendly for React rendering
- No URLs, citations, or links
- No conversational language or rhetorical questions
""",
    tools=[retrieve_content],
    output_key = "curriculum_designer",
)
