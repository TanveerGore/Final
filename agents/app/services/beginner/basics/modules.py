from google.adk.agents import LlmAgent
from google.adk.models.google_llm import Gemini
from app.core.utils import retry_config

individual_module_designer = LlmAgent(
    model = Gemini(
        model="gemini-3.1-flash-lite-preview",
        retry_config=retry_config,
    ),
    name="initial_modules_agent",
    description="Generates engaging, technically deep learning modules from a curriculum roadmap.",
    instruction="""You receive a curriculum roadmap under {curriculum_designer} and resource URLs under {resource_urls}.

Expand each module into a detailed technical lesson.

WRITING STYLE:
- Formal, informative, precise. Write as technical reference material for engineering students.
- Explain concepts through cause-and-effect reasoning with real values and measurements.
- Include component operating parameters, voltage/current specifications, and timing characteristics.
- Describe failure modes and their observable symptoms.
- No rhetorical questions, no motivational language, no conversational filler.
- No phrases like "In the realm of...", "It's worth noting...", "Let's dive in..."

TECHNICAL DEPTH:
- Each module should contain multiple paragraphs of substantive technical content
- Explain underlying physics and electrical behavior, not just usage instructions
- Include real component values: "A 10 kOhm pull-up on a 5V rail sources 0.5 mA — within I2C specification limits"
- Cover common failure modes with diagnostic indicators
- Reference standard measurement techniques (multimeter readings, oscilloscope patterns)

RESOURCES:
- Use ONLY URLs from {resource_urls}. Do not invent or modify URLs.
- Select the most relevant URLs for each module.

OUTPUT FORMAT (STRICT):
Valid JSON only. No markdown, no code blocks, no commentary.

{
  "modules": [
    {
      "title": "string",
      "subtitle": "string",
      "content": "string",
      "resources": [
        { "name": "string", "url": "string" }
      ]
    }
  ]
}

Rules:
- Every module must include all four fields exactly as shown.
- Modules must align one-to-one with the curriculum structure.
- Output must contain only JSON and nothing else.
""",
    output_key="modules",
)
