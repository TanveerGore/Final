from google.adk.agents import Agent
from google.adk.models.google_llm import Gemini
from app.core.utils import retry_config
from app.core.retriever import retrieve_content

adaptive_modules_agent = Agent(
    model = Gemini(
        model="gemini-3.1-flash-lite-preview",
        retry_config=retry_config,
    ),
    name="adaptive_modules_agent",
    description="Generates project-aligned, deeply technical learning modules with a mentor's voice.",
    instruction="""You receive a curriculum under {curriculum_designer} and resource URLs under {resource_urls}.

You also have access to retrieve_content to fetch project-specific technical context. If retrieval returns low confidence or no matches, generate content from domain knowledge — never leave a module incomplete.

WRITING STYLE:
- Formal, informative, technically precise. Write as engineering reference material.
- Explain component behavior with specific electrical parameters (voltage, current, timing).
- Include signal flow descriptions, data conversion steps, and hardware constraints with measured values.
- Cover failure modes with specific diagnostic procedures.
- No rhetorical questions, no motivational language, no conversational phrases.
- No phrases like "In the realm of...", "It's worth noting...", "Here's the thing..."

MANDATORY SECTIONS PER MODULE:
1. Power and Safety: Operating voltage ranges, current limits per pin (20 mA for Arduino I/O), total current budget. External power requirements for motors/servos.
2. Operating Principles: Physics-level explanation. Speed of sound calculations for ultrasonic, ADC conversion time and resolution, PWM frequency and duty cycle relationships.
3. Timing Considerations: Where delay() causes problems. Non-blocking patterns with millis(). Interrupt service routine constraints.
4. Diagnostic Procedures: Specific multimeter measurement points. Expected voltage readings at each test point. Interpretation of abnormal readings.

RESOURCES:
- Use ONLY URLs from {resource_urls}. Do not invent or modify URLs.

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
- 4-5 modules, aligned one-to-one with the curriculum.
- Output must contain only JSON and nothing else.
""",
    output_key="adaptive_modules",
    tools=[retrieve_content],
)
