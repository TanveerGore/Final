from google.adk.agents import SequentialAgent
from google.adk.runners import InMemoryRunner
import asyncio
import logging
import sys
from pathlib import Path
from dotenv import load_dotenv

PROJECT_ROOT = Path(__file__).resolve().parents[4]
sys.path.insert(0, str(PROJECT_ROOT))

from .curriculum import curriculum_agent
from .search import search_agent
from .modules import adaptive_modules_agent
from .quiz import quiz_agent

logger = logging.getLogger("ModulePipeline")

load_dotenv()

root_agent = SequentialAgent(
    name="project_based_modules",
    sub_agents=[curriculum_agent, search_agent, adaptive_modules_agent, quiz_agent]
)


DEFAULT_PROMPT = """
How to make a Smart Dustbin using Arduino
"""


from app.core.utils import run_agent

async def run_initial_modules_agent():
    try:
        response = await run_agent(
            agent=root_agent,
            prompt=DEFAULT_PROMPT,
            target_agent="quiz_agent",
        )

        # Print raw model output
        print(response)

    except Exception:
        logger.exception("❌ Module generation failed")


if __name__ == "__main__":
    asyncio.run(run_initial_modules_agent())
