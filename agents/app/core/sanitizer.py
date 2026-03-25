"""
Output sanitizer that programmatically removes common AI-generated
filler phrases, clichés, and formatting issues from agent outputs.
Applied as a post-processing step before returning to the client.
"""

import re
from typing import List, Tuple

# Phrases to remove entirely (case-insensitive)
SLOP_PHRASES: List[str] = [
    r"in the realm of",
    r"in today'?s (?:rapidly )?(?:evolving|changing|modern) (?:world|landscape|era)",
    r"it'?s (?:important|worth|crucial|essential|vital) to (?:note|mention|understand|remember|highlight) that",
    r"(?:as )?(?:we all know|you (?:may|might) know|it is well known)",
    r"without further ado",
    r"let'?s dive (?:right )?in",
    r"buckle up",
    r"(?:so,? )?let'?s get started",
    r"in (?:this|the following) (?:section|guide|tutorial|article)",
    r"(?:first and foremost|last but not least)",
    r"at the end of the day",
    r"it goes without saying",
    r"needless to say",
    r"having said that",
    r"with that (?:being )?said",
    r"(?:in )?conclusion",
    r"to summarize",
    r"in summary",
    r"all in all",
    r"when it comes to",
    r"at its core",
    r"the beauty of",
    r"the magic of",
    r"the power of",
    r"the world of",
    r"welcome to (?:the|this|our)",
    r"here'?s (?:the )?(?:thing|deal|kicker)",
    r"fun fact:?",
    r"pro tip:?",
    r"here'?s (?:a )?(?:fun|cool|interesting|neat) (?:fact|thing|tidbit)",
    r"you might be (?:wondering|asking|thinking)",
    r"glad you asked",
    r"great question",
    r"that'?s a great question",
    r"now,? (?:here'?s )?where (?:things|it) gets? (?:interesting|exciting|fun|cool|tricky)",
    r"(?:but )?wait,? there'?s more",
    r"drumroll (?:please)?",
    r"spoiler alert",
]

# Hollow superlatives to remove or replace
SUPERLATIVE_PATTERNS: List[Tuple[str, str]] = [
    (r"\b(?:game[- ]?changing|revolutionary|ground[- ]?breaking|cutting[- ]?edge|state[- ]?of[- ]?the[- ]?art)\b", ""),
    (r"\b(?:incredibly|amazingly|fantastically|remarkably|extraordinarily) ", ""),
    (r"\b(?:powerful|robust|seamless|elegant|beautiful|stunning|brilliant)\b(?= (?:solution|approach|method|way|technique))", "effective"),
]

# Excessive punctuation
PUNCTUATION_PATTERNS: List[Tuple[str, str]] = [
    (r"!{2,}", "!"),         # Multiple exclamation marks
    (r"!(?=\s*!)", ""),      # Repeated exclamation separated by space
    (r"\?{2,}", "?"),        # Multiple question marks
    (r"\.{4,}", "..."),      # Excessive dots
]

# Emoji removal (keep technical symbols)
EMOJI_PATTERN = re.compile(
    "["
    "\U0001F600-\U0001F64F"  # emoticons
    "\U0001F300-\U0001F5FF"  # symbols & pictographs
    "\U0001F680-\U0001F6FF"  # transport & map
    "\U0001F1E0-\U0001F1FF"  # flags
    "\U00002702-\U000027B0"
    "\U000024C2-\U0001F251"
    "\U0001f926-\U0001f937"
    "\U00010000-\U0010ffff"
    "\u2640-\u2642"
    "\u2600-\u2B55"
    "\u200d"
    "\u23cf"
    "\u23e9"
    "\u231a"
    "\ufe0f"
    "\u3030"
    "]+",
    flags=re.UNICODE,
)


def sanitize_output(text: str) -> str:
    """
    Remove AI-generated filler, clichés, excessive punctuation,
    and emojis from agent output text.
    """
    if not text or not text.strip():
        return text

    result = text

    # 1. Remove slop phrases (full sentence match — remove the sentence if it's only the phrase)
    for phrase in SLOP_PHRASES:
        # Remove the phrase when it starts a sentence
        result = re.sub(
            rf"(?i)(?:^|\n)\s*{phrase}[,.]?\s*",
            lambda m: m.group(0)[0] if m.group(0)[0] == '\n' else "",
            result,
        )
        # Remove inline occurrences
        result = re.sub(rf"(?i)\s*{phrase}[,.]?\s*", " ", result)

    # 2. Replace hollow superlatives
    for pattern, replacement in SUPERLATIVE_PATTERNS:
        result = re.sub(pattern, replacement, result, flags=re.IGNORECASE)

    # 3. Fix punctuation
    for pattern, replacement in PUNCTUATION_PATTERNS:
        result = re.sub(pattern, replacement, result)

    # 4. Remove emojis
    result = EMOJI_PATTERN.sub("", result)

    # 5. Clean up double spaces and leading/trailing whitespace on lines
    result = re.sub(r"[ \t]{2,}", " ", result)
    result = re.sub(r"\n[ \t]+\n", "\n\n", result)
    result = re.sub(r"\n{3,}", "\n\n", result)

    return result.strip()
