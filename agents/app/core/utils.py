import asyncio
import logging
from google.genai import types
from google.adk.runners import InMemoryRunner

logger = logging.getLogger("BeginnerUtils")

retry_config = types.HttpRetryOptions(
    attempts=5,  # Maximum retry attempts
    exp_base=7,  # Delay multiplier
    initial_delay=1,
    http_status_codes=[429, 500, 503, 504], # Retry on these HTTP errors
)

def extract_text_from_events(events, target_agents: list = None):
    """
    Safely extract model-generated text from ADK event stream.
    Handles None content and unexpected event shapes.
    If target_agents is a list, returns a dictionary mapping agent names to their output text.
    Otherwise, returns a single string of concatenated text.
    """
    if target_agents and isinstance(target_agents, list):
        results = {agent: [] for agent in target_agents}
    else:
        results = {"_default": []}

    for event in events:
        # Skip user echoes
        role = getattr(event, "role", None) or getattr(event, "author", None)
        if role == "user":
            continue

        # If standard agents mapping is used
        if target_agents and isinstance(target_agents, list):
            if role not in target_agents:
                continue
            target_key = role
        else:
            # If target_agents is a single string (legacy support)
            if target_agents and isinstance(target_agents, str) and role != target_agents:
                continue
            target_key = "_default"

        content = getattr(event, "content", None)
        if not content:
            continue

        parts = getattr(content, "parts", None)
        if not parts:
            continue

        for part in parts:
            text = getattr(part, "text", None)
            if text:
                results[target_key].append(text)

    # Return dict if array was passed, string otherwise
    if target_agents and isinstance(target_agents, list):
        return {k: "".join(v).strip() for k, v in results.items()}
    return "".join(results["_default"]).strip()

async def run_agent(
    agent,
    prompt: str,
    timeout: int = 60,
    target_agent=None, # kept for legacy compat
    target_agents: list = None,
):
    """
    Generic agent runner without JSON validation.
    """
    runner = InMemoryRunner(agent=agent)

    logger.info("▶️ Running agent...")
    try:
        events = await asyncio.wait_for(
            runner.run_debug(prompt, quiet=True),
            timeout=timeout,
        )
        
        # Prefer the new target_agents list parameter
        targets = target_agents if target_agents is not None else target_agent
        output_text = extract_text_from_events(events, target_agents=targets)
        logger.info("✅ Agent completed successfully")
        return output_text
        
    except Exception as e:
        import traceback
        logger.error(f"❌ Agent execution failed: {e}")
        logger.error(traceback.format_exc())

async def run_agent_with_retry(runner, prompt):
    """
    Retry logic for agent execution.
    """
    events = await runner.run_debug(prompt)
    return extract_text_from_events(events)

# Alias for compatibility if needed, though run_agent covers beginner logic
# The Expert agents used run_agent_with_retry which returns the response object directly
# whereas run_agent returns string content. 

