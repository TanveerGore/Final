import asyncio
from app.services.beginner.basics.pipeline import run_initial_modules_agent as run_basics
from app.services.beginner.dynamic.pipeline import run_initial_modules_agent as run_dynamic

async def main():
    print("Testing Basics Pipeline...")
    await run_basics()
    print("Testing Dynamic Pipeline...")
    await run_dynamic()

if __name__ == "__main__":
    asyncio.run(main())
