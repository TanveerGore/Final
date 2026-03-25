from google.adk.agents import LlmAgent
from google.adk.models.google_llm import Gemini
from google.adk.tools import google_search
from app.core.utils import retry_config
from app.core.url_validator import validate_urls_sync

# Step 1: Validate URLs using HTTP checks (function calling only)
url_validator_agent = LlmAgent(
    model=Gemini(
        model="gemini-3.1-flash-lite-preview",
        retry_config=retry_config,
    ),
    name="url_validator",
    description="Validates URLs by HTTP checking and flags broken links for replacement.",
    instruction="""You are a URL validation agent. Check that every URL in the input is accessible.

You will receive resource URLs under the key {resource_urls}.

VALIDATION PROCESS:
1. Collect ALL URLs from {resource_urls} into a single list.
2. Call validate_urls_sync with JSON input: {"urls": ["url1", "url2", ...]}
3. The tool returns which URLs are valid and which are invalid.
4. Keep only valid URLs. For invalid URLs, note the module_title they belonged to.

OUTPUT FORMAT (STRICT):
Valid JSON only. No markdown, no commentary.

{
  "validated_urls": [
    {
      "module_title": "string",
      "valid_urls": ["https://...", "https://..."],
      "needs_replacement": true or false
    }
  ]
}

Rules:
- Keep module_title values exactly as they are from {resource_urls}
- Remove any invalid URL from the list
- Set needs_replacement to true if any URL was removed
""",
    tools=[validate_urls_sync],
    output_key="validated_urls",
)

# Step 2: Replace broken links using Google Search (built-in tool only)
link_replacer_agent = LlmAgent(
    model=Gemini(
        model="gemini-3.1-flash-lite-preview",
        retry_config=retry_config,
    ),
    name="link_replacer",
    description="Finds replacement URLs for modules that lost links during validation.",
    instruction="""You are a link replacement agent. Review validated URLs and find replacements for modules that need more links.

You will receive validated URL data under {validated_urls} and the curriculum under {curriculum_designer}.

PROCESS:
1. For each module where needs_replacement is true or valid_urls has fewer than 3 URLs:
   a. Use google_search to find replacement URLs covering the same topic
   b. Only use URLs that appear directly in the google_search results
2. For modules with enough valid URLs, keep them as-is.

REPLACEMENT PRIORITY:
- arduino.cc, learn.sparkfun.com, learn.adafruit.com, docs.espressif.com
- randomnerdtutorials.com, lastminuteengineers.com, allaboutcircuits.com
- electronicshub.org, circuitdigest.com
- ti.com, microchip.com, digikey.com

RULES:
- Never fabricate URLs — only use URLs from google_search results
- Maintain the same JSON structure
- Keep module_title values exactly as they are
- Each module should have 3-5 verified URLs
- Remove any URL that cannot be verified or replaced

OUTPUT FORMAT (STRICT):
Valid JSON only. No markdown, no commentary.

{
  "resource_urls": [
    {
      "module_title": "string",
      "urls": ["https://...", "https://..."]
    }
  ]
}
""",
    tools=[google_search],
    output_key="resource_urls",
)
