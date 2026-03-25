
import json
import logging
from app.core.sanitizer import sanitize_output

logger = logging.getLogger("OutputStructurer")

async def structure_beginner_output(output_text: str) -> str:
    """
    Cleans and structures the raw output from the beginner agents.
    Removes markdown code blocks, excess whitespace, and AI filler.
    """
    if not output_text:
        return ""

    # Remove markdown code blocks ```json ... ``` or just ``` ... ```
    cleaned = output_text.strip()
    
    if cleaned.startswith("```"):
        # Find first newline
        first_newline = cleaned.find("\n")
        if first_newline != -1:
            # Remove first line (```json)
            cleaned = cleaned[first_newline+1:]
        
        # Remove trailing ```
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]

    # Apply sanitizer to remove AI filler
    cleaned = sanitize_output(cleaned)

    return cleaned.strip()
