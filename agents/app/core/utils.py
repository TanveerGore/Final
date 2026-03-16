import asyncio
import time
import logging
from google.genai import types
from google.adk.runners import InMemoryRunner
from app.core.token_tracker import tracker

logger = logging.getLogger("AgentUtils")

retry_config = types.HttpRetryOptions(
    attempts=5,
    exp_base=7,
    initial_delay=1,
    http_status_codes=[429, 500, 503, 504],
)


def _extract_token_usage(events) -> dict:
    """
    Extract token usage metadata from ADK events.
    Looks for usage_metadata on events that contain model responses.
    """
    total_input = 0
    total_output = 0
    for event in events:
        # ADK events may carry usage metadata in different places
        usage = getattr(event, "usage_metadata", None)
        if usage:
            total_input += getattr(usage, "prompt_token_count", 0) or 0
            total_output += getattr(usage, "candidates_token_count", 0) or 0
            continue
        # Also check inside content or model response
        llm_response = getattr(event, "llm_response", None)
        if llm_response:
            usage = getattr(llm_response, "usage_metadata", None)
            if usage:
                total_input += getattr(usage, "prompt_token_count", 0) or 0
                total_output += getattr(usage, "candidates_token_count", 0) or 0
    return {"input_tokens": total_input, "output_tokens": total_output}


def extract_text_from_events(events, target_agents: list = None):
    """
    Safely extract model-generated text from ADK event stream.
    If target_agents is a list, returns a dict mapping agent names to their output.
    Otherwise, returns a single concatenated string.
    """
    if target_agents and isinstance(target_agents, list):
        results = {agent: [] for agent in target_agents}
    else:
        results = {"_default": []}

    for event in events:
        author = getattr(event, "author", None)
        role = getattr(event, "role", None)
        agent_name = author or role

        if agent_name == "user":
            continue

        if target_agents and isinstance(target_agents, list):
            if agent_name not in target_agents:
                continue
            target_key = agent_name
        else:
            if target_agents and isinstance(target_agents, str) and agent_name != target_agents:
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

    if target_agents and isinstance(target_agents, list):
        return {k: "".join(v).strip() for k, v in results.items()}
    return "".join(results["_default"]).strip()


async def run_agent(
    agent,
    prompt: str,
    timeout: int = 120,
    target_agent=None,
    target_agents: list = None,
    endpoint: str = "unknown",
):
    """
    Generic agent runner for SequentialAgent pipelines.
    Tracks token usage and latency.
    """
    runner = InMemoryRunner(agent=agent)

    logger.info(f"▶️  Running agent '{agent.name}'...")
    start = time.time()
    try:
        events = await asyncio.wait_for(
            runner.run_debug(prompt, quiet=True),
            timeout=timeout,
        )
        latency = (time.time() - start) * 1000

        # Track tokens
        usage = _extract_token_usage(events)
        tracker.record(
            endpoint=endpoint,
            agent_name=agent.name,
            input_tokens=usage["input_tokens"],
            output_tokens=usage["output_tokens"],
            latency_ms=latency,
        )

        targets = target_agents if target_agents is not None else target_agent
        output_text = extract_text_from_events(events, target_agents=targets)
        logger.info(f"✅ Agent '{agent.name}' completed in {latency:.0f}ms")
        return output_text

    except asyncio.TimeoutError:
        logger.error(f"⏱️ Agent '{agent.name}' timed out after {timeout}s")
        tracker.record(
            endpoint=endpoint,
            agent_name=agent.name,
            input_tokens=0,
            output_tokens=0,
            latency_ms=(time.time() - start) * 1000,
            success=False,
            error_type="timeout",
        )
        raise
    except Exception as e:
        import traceback
        logger.error(f"❌ Agent '{agent.name}' execution failed: {e}")
        logger.error(traceback.format_exc())
        tracker.record(
            endpoint=endpoint,
            agent_name=agent.name,
            input_tokens=0,
            output_tokens=0,
            latency_ms=(time.time() - start) * 1000,
            success=False,
            error_type=type(e).__name__,
        )
        raise


async def run_agent_with_retry(
    runner: InMemoryRunner,
    prompt: str,
    max_retries: int = 3,
    base_delay: float = 2.0,
    timeout: int = 120,
    endpoint: str = "unknown",
):
    """
    Runs an agent via its InMemoryRunner with exponential backoff retry.
    Tracks token usage per successful call.
    """
    last_exception = None
    agent_name = getattr(getattr(runner, "_agent", None), "name", None) or "unknown"

    for attempt in range(1, max_retries + 1):
        try:
            logger.info(f"▶️  Attempt {attempt}/{max_retries} for {agent_name}...")
            start = time.time()
            events = await asyncio.wait_for(
                runner.run_debug(prompt, quiet=True),
                timeout=timeout,
            )
            latency = (time.time() - start) * 1000

            # Track tokens
            usage = _extract_token_usage(events)
            tracker.record(
                endpoint=endpoint,
                agent_name=agent_name,
                input_tokens=usage["input_tokens"],
                output_tokens=usage["output_tokens"],
                latency_ms=latency,
            )

            result = extract_text_from_events(events)
            if result:
                logger.info(f"✅ {agent_name} completed in {latency:.0f}ms")
                return result
            logger.warning(f"⚠️ Attempt {attempt} returned empty output, retrying...")

        except asyncio.TimeoutError:
            logger.warning(f"⏱️ Attempt {attempt} timed out after {timeout}s")
            last_exception = TimeoutError(f"Agent timed out after {timeout}s")

        except Exception as e:
            error_str = str(e).lower()
            is_transient = any(kw in error_str for kw in [
                "429", "resource exhausted", "rate limit",
                "500", "503", "504", "internal", "unavailable",
                "deadline", "timeout",
            ])
            if is_transient and attempt < max_retries:
                logger.warning(f"⚠️ Transient error on attempt {attempt}: {e}")
                last_exception = e
            else:
                raise

        if attempt < max_retries:
            delay = base_delay * (2 ** (attempt - 1))
            logger.info(f"⏳ Waiting {delay:.1f}s before retry...")
            await asyncio.sleep(delay)

    if last_exception:
        raise last_exception
    raise RuntimeError("Agent returned empty output after all retries")

