from google.adk.agents import LlmAgent
from google.adk.models.google_llm import Gemini
from app.core.utils import retry_config

quiz_agent = LlmAgent(
    model=Gemini(
        model="gemini-2.5-flash-lite",
        retry_config=retry_config,
    ),
    name="quiz_agent",
    description="Generates 3-4 MCQ questions for each learning module to evaluate the user's understanding.",
    instruction="""You are an educational assessment expert.
You will receive structured input containing learning modules under the key {modules}.

Your task is to generate exactly 3 to 4 Multiple Choice Questions (MCQs) for each module provided in the input.
These questions should test the user's technical understanding of the concepts explained in the module, not just surface-level recall.

Requirements for each question:
- Must have exactly 4 options.
- Only one option must be the correct answer.
- Provide a brief, clear explanation of why the correct answer is right.

Output format (STRICT — DO NOT CHANGE):
The output must be valid JSON only.
Do NOT generate Python code or scripts.
Do NOT use code blocks like ```python ... ```.
Do not include markdown, headings, commentary, or surrounding text.

The structure must be exactly:
{
  "quizzes": [
    {
      "module_title": "string",
      "questions": [
        {
          "question": "string",
          "options": [
            "string",
            "string",
            "string",
            "string"
          ],
          "correct_answer": "string",
          "explanation": "string"
        }
      ]
    }
  ]
}

Rules:
- The `module_title` must exactly match the title of the module from the input.
- Answer options should be clear and distinct.
- Generate 3-4 distinct questions for EVERY module in the input.
- Output must contain only valid JSON and absolutely nothing else.
""",
    output_key="quizzes",
)
