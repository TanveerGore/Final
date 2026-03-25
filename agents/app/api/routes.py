from fastapi import APIRouter, HTTPException
import asyncio
import os
import subprocess
import json
import logging
import time
import uuid
from dotenv import load_dotenv

from app.core.models import (
    ProjectDescriptionRequest, ProjectRequest, MainAgentResponse, 
    CodeAgentResponse, QARequest, QAResponse, ProjectNameResponse,
    BasicModulesResponse, AdaptiveModulesResponse, CompileRequest, FlashRequest
)
from app.services.expert.assistants import (
    desc_runner, wiring_runner, code_runner, qa_runner, name_runner, reviewer_runner,
    fact_checker_runner
)
from app.core.utils import run_agent, run_agent_with_retry
from app.core.token_tracker import tracker
from app.services.beginner.basics import root_agent as basic_runner
from app.services.beginner.dynamic import root_agent as adaptive_runner

from app.core.formatter import format_output, extract_text_only
from app.core.structurer import structure_beginner_output
from app.core.sanitizer import sanitize_output

logger = logging.getLogger("Routes")
router = APIRouter()

LAST_PROJECT_FILE = None
load_dotenv()


async def _review_output(text: str, endpoint: str) -> str:
    """Run text through the reviewer agent for quality enhancement."""
    if not text or not text.strip():
        return text
    try:
        review_prompt = f"Review and improve this content:\n\n{text}"
        reviewed = await run_agent_with_retry(
            reviewer_runner, review_prompt, max_retries=2, timeout=90,
            endpoint=endpoint,
        )
        if reviewed and reviewed.strip():
            return reviewed
    except Exception as e:
        logger.warning(f"Reviewer failed, using original output: {e}")
    return text


async def _fact_check_output(text: str, endpoint: str) -> str:
    """Run text through the fact checker agent for technical accuracy."""
    if not text or not text.strip():
        return text
    try:
        check_prompt = f"Verify technical accuracy of this content:\n\n{text}"
        checked = await run_agent_with_retry(
            fact_checker_runner, check_prompt, max_retries=2, timeout=90,
            endpoint=endpoint,
        )
        if checked and checked.strip():
            return checked
    except Exception as e:
        logger.warning(f"Fact checker failed, using original output: {e}")
    return text


# --- Endpoints ---

@router.post("/project-name", response_model=ProjectNameResponse)
async def get_project_name(request: ProjectDescriptionRequest):
    """Identifies the project name from a user's description."""
    description = request.user_description
    logger.info(f"Identifying project for: {description[:80]}...")
    
    try:
        prompt = (
            f"Identify the specific electronics/Arduino project name from this user description. "
            f"Search the knowledge base first, then use your own knowledge if needed.\n\n"
            f"User description: {description}"
        )
        response = await run_agent_with_retry(
            name_runner, prompt, endpoint="project-name"
        )
        
        clean_name = await structure_beginner_output(response)
        if not clean_name:
            clean_name = str(response).strip()
        
        clean_name = clean_name.strip('"\'').strip()
        
        return ProjectNameResponse(project_name=clean_name)
    except Exception as e:
        logger.error(f"Project name identification failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/main-agent", response_model=MainAgentResponse)
async def run_main_agent(request: ProjectRequest):
    """Runs description and wiring agents, then reviews and fact-checks output quality."""
    topic = request.project_topic
    logger.info(f"Running Main Agent (Description + Wiring) for: {topic}")
    pipeline_id = str(uuid.uuid4())[:8]
    pipeline_start = time.time()
    pipeline_success = True
    
    try:
        # 1. Description Agent
        logger.info("   > Starting description agent...")
        desc_prompt = (
            f"Generate a complete technical project briefing for: {topic}\n\n"
            f"Search the knowledge base for project details. If the knowledge base has limited or no data "
            f"for this specific project, generate from domain knowledge. "
            f"Do not return any error message — always produce complete output."
        )
        desc_result = await run_agent_with_retry(
            desc_runner, desc_prompt, endpoint="main-agent"
        )
        desc_output = await structure_beginner_output(desc_result)
        if not desc_output.strip():
            desc_output = str(desc_result)
        
        await asyncio.sleep(1.5)
        
        # 2. Wiring Agent
        logger.info("   > Starting wiring agent...")
        wiring_prompt = (
            f"Generate a complete hardware wiring and assembly guide for: {topic}\n\n"
            f"Include: bill of materials with exact specifications, complete pin-level wiring connections, "
            f"assembly sequence, and critical warnings.\n"
            f"Search the knowledge base for wiring data. If the knowledge base has limited or no data "
            f"for this project, generate from domain knowledge. "
            f"Do not return any error message — always produce complete output."
        )
        wiring_result = await run_agent_with_retry(
            wiring_runner, wiring_prompt, endpoint="main-agent"
        )
        wiring_output = format_output(str(wiring_result))
        if not wiring_output.strip():
            wiring_output = str(wiring_result)
        
        # 3. Quality review both outputs in parallel
        logger.info("   > Running quality review...")
        reviewed_desc, reviewed_wiring = await asyncio.gather(
            _review_output(desc_output, endpoint="main-agent"),
            _review_output(wiring_output, endpoint="main-agent"),
        )
        
        # 4. Fact-check both outputs in parallel
        logger.info("   > Running fact check...")
        checked_desc, checked_wiring = await asyncio.gather(
            _fact_check_output(reviewed_desc, endpoint="main-agent"),
            _fact_check_output(reviewed_wiring, endpoint="main-agent"),
        )
        
        # 5. Sanitize outputs
        checked_desc = sanitize_output(checked_desc)
        checked_wiring = sanitize_output(checked_wiring)
        
        return MainAgentResponse(
            description_agent_output=checked_desc,
            wiring_agent_output=checked_wiring
        )
    except Exception as e:
        pipeline_success = False
        logger.error(f"Main Agent Failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        tracker.record_pipeline(
            pipeline_id=pipeline_id,
            endpoint="main-agent",
            start_time=pipeline_start,
            end_time=time.time(),
            agent_count=4,  # desc + wiring + reviewer×2 + fact_checker×2
            success=pipeline_success,
        )

@router.post("/code-agent", response_model=CodeAgentResponse)
async def run_code_agent(request: ProjectRequest):
    """Generates Arduino/embedded code for a project."""
    global LAST_PROJECT_FILE
    topic = request.project_topic
    logger.info(f"Running Code Agent for: {topic}")
    
    try:
        prompt = (
            f"Generate complete, production-ready Arduino code for: {topic}\n\n"
            f"Search the code knowledge base for reference implementations. "
            f"If no code is found in the knowledge base, write the entire program from scratch "
            f"using your expert knowledge of Arduino/embedded systems programming.\n"
            f"Output ONLY the code in a single code block. No explanations."
        )
        response = await run_agent_with_retry(
            code_runner, prompt, endpoint="code-agent"
        )
        clean_response = await structure_beginner_output(response)
        if not clean_response.strip():
            clean_response = str(response)

        # Save code to file for arduino-cli
        import time
        timestamp = int(time.time())
        project_name = f"Project_{timestamp}"
        sketch_dir = os.path.join(os.getcwd(), "sketches", project_name)
        os.makedirs(sketch_dir, exist_ok=True)
        
        sketch_path = os.path.join(sketch_dir, f"{project_name}.ino")
        with open(sketch_path, "w") as f:
            f.write(clean_response)
            
        LAST_PROJECT_FILE = sketch_path
        logger.info(f"Saved sketch to: {LAST_PROJECT_FILE}")
        return CodeAgentResponse(code=clean_response)
    except Exception as e:
        logger.error(f"Code Agent Failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/beginner/basics", response_model=BasicModulesResponse)
async def run_basic_modules(request: ProjectRequest):
    """Generates foundational electronics learning modules with quizzes."""
    topic = request.project_topic
    if topic:
        prompt = (
            f"Create 4 comprehensive learning modules on foundational electronics and embedded systems topics "
            f"relevant to building projects like: {topic}.\n\n"
            f"Each module should provide deep technical explanations suitable for engineering students -- "
            f"not surface-level summaries. Cover analog/digital electronics, microcontroller fundamentals, "
            f"sensor interfacing, and practical debugging skills."
        )
    else:
        prompt = (
            "Create 4 comprehensive learning modules on foundational electronics and embedded systems topics "
            "for engineering students. Cover analog/digital electronics, microcontroller fundamentals, "
            "sensor interfacing, and practical debugging skills. "
            "Each module should provide deep technical explanations -- not surface-level summaries."
        )
    
    logger.info(f"Running Basic Modules Agent for: {topic if topic else 'General'}")
    try:
        responses = await run_agent(
            basic_runner, 
            prompt, 
            timeout=300, 
            target_agents=["initial_modules_agent", "quiz_agent"],
            endpoint="beginner-basics",
        )
        clean_modules = await structure_beginner_output(responses.get("initial_modules_agent", ""))
        clean_quizzes = await structure_beginner_output(responses.get("quiz_agent", ""))
        return BasicModulesResponse(modules=clean_modules, quizzes=clean_quizzes)
    except Exception as e:
        logger.error(f"Basic Modules Failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/beginner/adaptive", response_model=AdaptiveModulesResponse)
async def run_adaptive_modules(request: ProjectRequest):
    """Generates project-specific adaptive learning modules with quizzes."""
    topic = request.project_topic
    logger.info(f"Running Adaptive Modules Agent for: {topic}")
    try:
        prompt = (
            f"Create a project-specific learning curriculum for building: {topic}\n\n"
            f"Design 4-5 technical modules that teach the student the exact skills needed "
            f"to understand, build, wire, program, and debug this project. "
            f"Search the knowledge base for project-specific technical details to inform the curriculum."
        )
        responses = await run_agent(
            adaptive_runner, 
            prompt, 
            timeout=300, 
            target_agents=["adaptive_modules_agent", "quiz_agent"],
            endpoint="beginner-adaptive",
        )
        clean_modules = await structure_beginner_output(responses.get("adaptive_modules_agent", ""))
        clean_quizzes = await structure_beginner_output(responses.get("quiz_agent", ""))
        return AdaptiveModulesResponse(modules=clean_modules, quizzes=clean_quizzes)
    except Exception as e:
        logger.error(f"Adaptive Modules Failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/troubleshoot", response_model=QAResponse)
async def run_troubleshoot(request: QARequest):
    """Troubleshoots electronics/embedded systems issues."""
    user_query = request.query
    logger.info(f"Running Troubleshoot Agent for: {user_query[:80]}...")
    
    context_parts = []
    if request.project_topic:
        context_parts.append(f"Project context: {request.project_topic}")
    context_parts.append(f"User's issue/question: {user_query}")
    
    full_prompt = (
        "\n".join(context_parts) + "\n\n"
        "Diagnose this issue step by step. Search the knowledge base for project-specific details. "
        "If no project data is found, use your own expert troubleshooting knowledge. "
        "Always provide actionable diagnostic steps and fixes."
    )
    
    try:
        response = await run_agent_with_retry(
            qa_runner, full_prompt, endpoint="troubleshoot"
        )
        clean_response = format_output(str(response))
        if not clean_response.strip():
            clean_response = str(response)
        clean_response = sanitize_output(clean_response)
        return QAResponse(response=clean_response)
    except Exception as e:
        logger.error(f"Troubleshoot Failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# --- Token Analytics ---

@router.get("/analytics/tokens")
async def get_token_analytics():
    """Returns comprehensive token usage analytics across all endpoints and agents."""
    return tracker.get_analytics()

@router.post("/analytics/tokens/reset")
async def reset_token_analytics():
    """Resets all token usage tracking data."""
    tracker.reset()
    return {"message": "Token analytics cleared"}


# ---------- Arduino Compile ----------
@router.post("/arduino/compile")
def compile_arduino(req: CompileRequest):
    global LAST_PROJECT_FILE
    if not LAST_PROJECT_FILE or not os.path.exists(LAST_PROJECT_FILE):
        raise HTTPException(status_code=400, detail="No project file available. Run /ask first (or ensure code generation sets this).")

    sketch_dir = os.path.dirname(LAST_PROJECT_FILE)
    build_dir = os.path.join(sketch_dir, "build")
    os.makedirs(build_dir, exist_ok=True)

    try:
        result = subprocess.run(
            [
                "arduino-cli", "compile",
                "--fqbn", req.fqbn,
                "--output-dir", build_dir,
                sketch_dir
            ],
            capture_output=True, text=True, check=True
        )
        return {"success": True, "message": result.stdout}

    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=400, detail=e.stderr)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------- Arduino Flash ----------
@router.post("/arduino/flash")
def flash_code(req: FlashRequest):
    global LAST_PROJECT_FILE
    if not LAST_PROJECT_FILE or not os.path.exists(LAST_PROJECT_FILE):
        raise HTTPException(status_code=400, detail="No project file available. Run /ask first.")

    sketch_dir = os.path.dirname(LAST_PROJECT_FILE)
    build_dir = os.path.join(sketch_dir, "build")

    try:
        subprocess.run(
            ["arduino-cli", "compile", "--fqbn", req.fqbn, "--output-dir", build_dir, sketch_dir],
            check=True, capture_output=True, text=True
        )

        result = subprocess.run(
            ["arduino-cli", "upload", "-p", req.port, "--fqbn", req.fqbn, "--input-dir", build_dir, sketch_dir],
            check=True, capture_output=True, text=True
        )
        return {"success": True, "message": result.stdout}

    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=400, detail=e.stderr)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------- Arduino Boards ----------
@router.get("/arduino/boards")
def list_boards():
    """List connected Arduino boards with robust error handling."""
    try:
        command = ["arduino-cli", "board", "list", "--format", "json"]
        result = subprocess.run(
            command, 
            capture_output=True, 
            text=True, 
            check=True
        )

        if not result.stdout.strip():
            return {"boards": [], "message": "No connected boards found."}

        return json.loads(result.stdout)

    except FileNotFoundError:
        raise HTTPException(
            status_code=500, 
            detail="'arduino-cli' not found. Please ensure it is installed and in your system's PATH."
        )
    except subprocess.CalledProcessError as e:
        raise HTTPException(
            status_code=500, 
            detail=f"An error occurred with arduino-cli. Return code: {e.returncode}. Stderr: {e.stderr}. Stdout: {e.stdout}"
        )
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to parse JSON from arduino-cli. Raw output: {result.stdout}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"An unexpected error occurred: {str(e)}"
        )
