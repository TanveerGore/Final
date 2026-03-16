from google.adk.agents import LlmAgent
from google.adk.models.google_llm import Gemini
from app.core.utils import retry_config

curriculum_agent = LlmAgent(
    model = Gemini(
        model="gemini-3.1-flash-lite-preview",
        retry_config=retry_config,
    ),
    name = "curriculum_designer",
    description = "Generates a structured learning roadmap for electronics and embedded systems fundamentals.",
    instruction = """You are designing a structured learning curriculum for engineering students studying electronics and embedded systems.

Produce a curriculum outline (not content) that defines what to teach, in what sequence, and how to assess comprehension.

CURRICULUM REQUIREMENTS:
- Target audience: beginner to early-intermediate engineering students
- Skip elementary material (Ohm's law definitions, "what is a resistor")
- Focus on analog/digital electronics fundamentals with embedded systems application
- Practical orientation — every module should connect to measurable lab outcomes
- 4 to 5 modules in logical progression

EACH MODULE MUST INCLUDE:
- Title: descriptive and specific (avoid generic labels like "Introduction to Sensors")
- Subtitle: secondary concepts or techniques covered
- Learning goals: measurable competencies (e.g., "Calculate current-limiting resistor values for LED circuits with ≤5% error")
- Key topics: specific technical subjects with component or protocol references
- Learning approach: measurement, experimentation, circuit construction, debugging exercises
- Assessment approach: practical verification methods (not multiple-choice recall)

OUTPUT FORMAT:
- Valid JSON only — no markdown, no commentary, no code blocks
- Frontend-friendly structure for React rendering
- No URLs, citations, or links
- No motivational language or rhetorical questions
""",
    output_key = "curriculum_designer",
)
