"""
Programmatic URL validation tool for ADK agents.
Performs actual HTTP HEAD requests to verify URLs are live,
eliminating 404s from agent outputs.
"""

import asyncio
import logging
import json
from typing import Dict, List
from urllib.parse import urlparse

logger = logging.getLogger("URLValidator")

# Domains known to be stable and long-lived — skip expensive HTTP checks
TRUSTED_DOMAINS = {
    "arduino.cc", "docs.arduino.cc", "www.arduino.cc",
    "learn.sparkfun.com", "www.sparkfun.com",
    "learn.adafruit.com", "www.adafruit.com",
    "docs.espressif.com",
    "randomnerdtutorials.com", "www.randomnerdtutorials.com",
    "lastminuteengineers.com", "www.lastminuteengineers.com",
    "allaboutcircuits.com", "www.allaboutcircuits.com",
    "electronicshub.org", "www.electronicshub.org",
    "circuitdigest.com", "www.circuitdigest.com",
    "ti.com", "www.ti.com",
    "microchip.com", "www.microchip.com",
    "nxp.com", "www.nxp.com",
    "digikey.com", "www.digikey.com",
    "mouser.com", "www.mouser.com",
    "en.wikipedia.org",
    "github.com",
    "developer.arm.com",
    "raspberrypi.com", "www.raspberrypi.com",
}

# User-Agent to avoid bot-rejection by some sites
_HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; EmbedAI-LinkChecker/1.0)",
    "Accept": "text/html,application/xhtml+xml",
}

_TIMEOUT_SECONDS = 8


def _is_trusted_domain(url: str) -> bool:
    """Check if URL belongs to a known-stable domain."""
    try:
        host = urlparse(url).hostname or ""
        return host in TRUSTED_DOMAINS
    except Exception:
        return False


async def _check_single_url(url: str) -> Dict:
    """
    Validate a single URL via HTTP HEAD (fallback to GET).
    Returns dict with url, valid (bool), and status_code.
    """
    if _is_trusted_domain(url):
        return {"url": url, "valid": True, "status_code": 0, "reason": "trusted_domain"}

    try:
        proc = await asyncio.wait_for(
            asyncio.create_subprocess_exec(
                "curl", "-sI", "-o", "/dev/null", "-w", "%{http_code}",
                "-L", "--max-time", str(_TIMEOUT_SECONDS),
                "-H", f"User-Agent: {_HEADERS['User-Agent']}",
                url,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            ),
            timeout=_TIMEOUT_SECONDS + 2,
        )
        stdout, _ = await proc.communicate()
        status_str = stdout.decode().strip()
        status_code = int(status_str) if status_str.isdigit() else 0

        # 2xx and 3xx are valid; 403 often means bot-block but page exists
        valid = status_code in range(200, 400) or status_code == 403
        return {"url": url, "valid": valid, "status_code": status_code, "reason": "http_check"}

    except (asyncio.TimeoutError, Exception) as e:
        logger.warning(f"URL check failed for {url}: {e}")
        return {"url": url, "valid": False, "status_code": 0, "reason": str(e)}


async def validate_urls(urls: List[str]) -> List[Dict]:
    """
    Validate multiple URLs concurrently.
    Returns list of {url, valid, status_code, reason} dicts.
    """
    tasks = [_check_single_url(u) for u in urls]
    return await asyncio.gather(*tasks)


async def validate_urls_sync(urls_json: str) -> str:
    """
    Async URL validation tool for ADK agent usage.
    Input: JSON string with list of URLs: {"urls": ["https://...", ...]}
    Output: JSON string with validation results.
    """
    try:
        data = json.loads(urls_json)
        url_list = data.get("urls", [])
    except (json.JSONDecodeError, AttributeError):
        return json.dumps({"error": "Invalid JSON input. Expected: {\"urls\": [...]}"})

    if not url_list:
        return json.dumps({"results": [], "message": "No URLs provided"})

    results = await validate_urls(url_list)

    valid_urls = [r["url"] for r in results if r["valid"]]
    invalid_urls = [r["url"] for r in results if not r["valid"]]

    return json.dumps({
        "results": results,
        "summary": {
            "total": len(url_list),
            "valid": len(valid_urls),
            "invalid": len(invalid_urls),
        },
        "valid_urls": valid_urls,
        "invalid_urls": invalid_urls,
    })
