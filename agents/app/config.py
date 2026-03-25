"""
Generation configurations for agents.
Uses google.genai.types.GenerateContentConfig for type safety.
"""

from google.genai import types

# Balanced configuration for educational content
GENERATION_CONFIG = types.GenerateContentConfig(
    temperature=0.7,
    top_p=0.92,
    top_k=45,
    max_output_tokens=8192,
    candidate_count=1,
)

# Configuration for strict JSON output
JSON_GENERATION_CONFIG = types.GenerateContentConfig(
    temperature=0.5,
    top_p=0.85,
    top_k=35,
    max_output_tokens=8192,
    candidate_count=1,
    response_mime_type="application/json",
)

# Creative configuration for engaging, mentor-like content
CREATIVE_CONFIG = types.GenerateContentConfig(
    temperature=0.85,
    top_p=0.95,
    top_k=50,
    max_output_tokens=8192,
    candidate_count=1,
)

# Factual configuration for grounded, precise technical content
FACTUAL_CONFIG = types.GenerateContentConfig(
    temperature=0.45,
    top_p=0.85,
    top_k=35,
    max_output_tokens=8192,
    candidate_count=1,
)

# Code generation configuration - low temperature for correctness
CODE_CONFIG = types.GenerateContentConfig(
    temperature=0.3,
    top_p=0.8,
    top_k=25,
    max_output_tokens=16384,
    candidate_count=1,
)
