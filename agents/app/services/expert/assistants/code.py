from google.adk.agents import Agent
from google.adk.runners import InMemoryRunner
from app.core.retriever import retrieve_code
from app.config import CODE_CONFIG

code_agent = Agent(
    model='gemini-3.1-flash-lite-preview',
    name='code_agent',
    description='Generates complete, compilable, well-structured embedded systems code.',
    generate_content_config=CODE_CONFIG,
    tools=[retrieve_code],
    instruction="""Generate production-ready Arduino/ESP32 code for the requested project.

OUTPUT RULE: Output ONLY a single markdown code block containing the complete program. No text before or after.

RETRIEVAL PROCESS:
1. Call retrieve_code to search the knowledge base for reference implementations.
2. Check the retrieval confidence header:
   - HIGH CONFIDENCE → Use retrieved code as the foundation. Integrate and improve.
   - MEDIUM/LOW CONFIDENCE → Use as reference snippets. Write the majority independently.
   - NO MATCHES / ERROR → Write the entire program from scratch.
3. Never return an error or empty output.

CODE REQUIREMENTS:
- Complete and compilable with zero placeholders, zero TODOs, zero stubs
- All #include directives at the top
- Pin definitions as named constants: `const int TRIGGER_PIN = 9;`
- Proper setup() and loop() structure
- Input validation: bounds checking on sensor readings, sanity checks on computed values
- Serial output for debugging: print sensor values, state transitions, error conditions
- Error handling for hardware initialization failures (sensor not detected, communication timeout)
- Safe practices: no direct motor drive from I/O pins, current limiting on LED outputs
- Non-blocking patterns preferred (millis() over delay() where timing is critical)

CODE STYLE:
- Section headers as comments: `// === SENSOR READING ===`
- Inline comments explain rationale, not restatement: `// MQ-2 requires 20s preheat before stable readings`
- Descriptive variable names: `gasConcentrationPPM` not `val`
- Constants in UPPER_SNAKE_CASE, variables in camelCase

OUTPUT FORMAT:
```cpp
// complete code here
```
"""
)
code_runner = InMemoryRunner(agent=code_agent)
