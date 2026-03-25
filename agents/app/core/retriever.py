import os
import re
import logging
from typing import Dict, List, Tuple
from dotenv import load_dotenv

from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import FAISS
from rank_bm25 import BM25Okapi

# ============================================================
# ENV
# ============================================================
load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
EMBED_MODEL = os.getenv("EMBEDDING_MODEL", "text-embedding-3-small")

# ============================================================
# CONFIG
# ============================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CONTENT_DB_PATH = os.path.join(BASE_DIR, "faiss_content")
CODE_DB_PATH = os.path.join(BASE_DIR, "faiss_code")

# Retrieval tuning
MAX_CANDIDATES = 20          # pull many candidates for re-ranking
FINAL_CONTEXT_LIMIT = 6      # send best N to LLM
SCORE_THRESHOLD = 1.4         # FAISS L2 distance: lower = better; discard above this
HIGH_CONFIDENCE_THRESHOLD = 0.8
BM25_WEIGHT = 0.3             # weight for BM25 in hybrid score (0-1)
SEMANTIC_WEIGHT = 0.7         # weight for FAISS semantic score
DEDUP_SIMILARITY = 0.85       # content overlap ratio for deduplication
MAX_CHUNK_LENGTH = 1500       # truncate individual chunks to this length for LLM context

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("UniversalRetriever")

# ============================================================
# ELECTRONICS DOMAIN SYNONYM MAP
# ============================================================

SYNONYM_MAP: Dict[str, List[str]] = {
    "led": ["light emitting diode", "LED"],
    "ir": ["infrared", "IR sensor"],
    "pir": ["passive infrared", "motion sensor", "PIR"],
    "ultrasonic": ["HC-SR04", "distance sensor", "sonar"],
    "mq2": ["MQ-2", "gas sensor", "smoke sensor"],
    "mq135": ["MQ-135", "air quality sensor"],
    "dht11": ["DHT11", "temperature humidity sensor"],
    "dht22": ["DHT22", "AM2302"],
    "ldr": ["light dependent resistor", "photoresistor", "LDR"],
    "servo": ["servo motor", "SG90", "MG996R"],
    "dc motor": ["DC motor", "motor driver", "L298N", "L293D"],
    "stepper": ["stepper motor", "28BYJ-48", "A4988", "DRV8825"],
    "lcd": ["liquid crystal display", "16x2 LCD", "I2C LCD", "HD44780"],
    "oled": ["OLED display", "SSD1306", "128x64"],
    "rfid": ["RFID", "RC522", "MFRC522"],
    "bluetooth": ["HC-05", "HC-06", "BLE", "Bluetooth module"],
    "wifi": ["WiFi", "ESP8266", "ESP32", "NodeMCU"],
    "gps": ["GPS", "NEO-6M", "NMEA"],
    "relay": ["relay module", "5V relay", "optocoupler relay"],
    "buzzer": ["piezo buzzer", "active buzzer", "passive buzzer"],
    "keypad": ["4x4 keypad", "membrane keypad", "matrix keypad"],
    "potentiometer": ["pot", "variable resistor", "trimpot"],
    "i2c": ["I2C", "TWI", "SDA SCL", "Wire library"],
    "spi": ["SPI", "MOSI MISO", "slave select"],
    "uart": ["UART", "serial", "TX RX", "Serial communication"],
    "pwm": ["PWM", "pulse width modulation", "analogWrite"],
    "adc": ["ADC", "analog to digital", "analogRead"],
    "esp32": ["ESP32", "ESP-WROOM-32", "dual core"],
    "esp8266": ["ESP8266", "NodeMCU", "D1 Mini"],
    "arduino uno": ["Arduino Uno", "ATmega328P", "Uno R3"],
    "arduino mega": ["Arduino Mega", "ATmega2560", "Mega 2560"],
    "smart dustbin": ["automatic dustbin", "smart trash can", "waste bin"],
    "home automation": ["smart home", "IoT home", "home control"],
    "line follower": ["line following robot", "line tracker"],
    "obstacle avoidance": ["obstacle avoiding robot", "collision avoidance"],
}

# ============================================================
# INIT
# ============================================================

embeddings = OpenAIEmbeddings(
    model=EMBED_MODEL,
    openai_api_key=OPENAI_API_KEY
)

print("Loading FAISS indexes...")

content_db = FAISS.load_local(
    CONTENT_DB_PATH,
    embeddings,
    allow_dangerous_deserialization=True
)

code_db = FAISS.load_local(
    CODE_DB_PATH,
    embeddings,
    allow_dangerous_deserialization=True
)

print("FAISS indexes loaded.\n")

# ============================================================
# BM25 INDEX CONSTRUCTION
# ============================================================

def _build_bm25_index(db: FAISS) -> Tuple[BM25Okapi, list]:
    """Build a BM25 index from all documents in a FAISS vectorstore."""
    docstore = db.docstore
    all_docs = []
    for doc_id in db.index_to_docstore_id.values():
        doc = docstore.search(doc_id)
        if doc and hasattr(doc, "page_content"):
            all_docs.append(doc)

    tokenized = [doc.page_content.lower().split() for doc in all_docs]
    bm25 = BM25Okapi(tokenized) if tokenized else None
    return bm25, all_docs


logger.info("Building BM25 indexes for hybrid retrieval...")
_content_bm25, _content_docs = _build_bm25_index(content_db)
_code_bm25, _code_docs = _build_bm25_index(code_db)
logger.info(f"BM25 indexes built: content={len(_content_docs)} docs, code={len(_code_docs)} docs")


# ============================================================
# QUERY EXPANSION (IMPROVED)
# ============================================================

def _expand_query(query: str) -> List[str]:
    """
    Generate multiple search variations from the original query
    using domain-specific synonym expansion and term extraction.
    """
    queries = [query]
    query_lower = query.lower()

    # Extract core terms by removing filler words
    core = re.sub(
        r'\b(provide|extract|find|get|give|show|create|make|build|how to|'
        r'the|a|an|for|of|and|with|using|generate|complete|write|i want|'
        r'i need|can you|please|help me)\b',
        ' ', query, flags=re.IGNORECASE
    ).strip()
    core = re.sub(r'\s+', ' ', core)
    if core and core.lower() != query_lower:
        queries.append(core)

    # Synonym expansion — add queries with expanded component names
    for term, synonyms in SYNONYM_MAP.items():
        if term in query_lower:
            for syn in synonyms[:2]:  # limit to avoid query explosion
                expanded = query_lower.replace(term, syn.lower())
                if expanded != query_lower:
                    queries.append(expanded)
                    break  # one synonym expansion per matched term

    # Add Arduino/embedded context if project-related keywords detected
    project_keywords = [
        "sensor", "motor", "led", "relay", "buzzer", "lcd", "servo",
        "ultrasonic", "temperature", "humidity", "gas", "ir", "rfid",
        "bluetooth", "wifi", "iot", "smart", "detector", "monitor",
        "robot", "automation", "alarm", "display", "control"
    ]
    if "arduino" not in query_lower and any(kw in query_lower for kw in project_keywords):
        queries.append(f"{core} arduino project")

    # Add component-focused variant
    if "components" not in query_lower and "wiring" not in query_lower:
        queries.append(f"{core} components wiring circuit")

    # Deduplicate while preserving order
    seen = set()
    unique = []
    for q in queries:
        q_norm = q.lower().strip()
        if q_norm and q_norm not in seen:
            seen.add(q_norm)
            unique.append(q)

    return unique[:5]  # cap at 5 variations


# ============================================================
# DEDUPLICATION
# ============================================================

def _content_overlap(text_a: str, text_b: str) -> float:
    """Calculate word-level Jaccard similarity between two texts."""
    words_a = set(text_a.lower().split())
    words_b = set(text_b.lower().split())
    if not words_a or not words_b:
        return 0.0
    intersection = words_a & words_b
    union = words_a | words_b
    return len(intersection) / len(union)


def _deduplicate(docs_with_scores: list, threshold: float = DEDUP_SIMILARITY) -> list:
    """Remove near-duplicate documents based on content overlap."""
    kept = []
    for doc, score in docs_with_scores:
        is_dup = False
        for kept_doc, _ in kept:
            if _content_overlap(doc.page_content, kept_doc.page_content) > threshold:
                is_dup = True
                break
        if not is_dup:
            kept.append((doc, score))
    return kept


# ============================================================
# CONTEXTUAL COMPRESSION
# ============================================================

def _compress_chunk(text: str, max_length: int = MAX_CHUNK_LENGTH) -> str:
    """
    Trim a retrieved chunk to fit within the context budget.
    Preserves the beginning (most likely to contain key info)
    and truncates at a sentence boundary when possible.
    """
    if len(text) <= max_length:
        return text

    truncated = text[:max_length]
    # Try to cut at the last sentence boundary
    last_period = truncated.rfind(".")
    last_newline = truncated.rfind("\n")
    cut_point = max(last_period, last_newline)
    if cut_point > max_length * 0.6:
        truncated = truncated[:cut_point + 1]

    return truncated.strip()


# ============================================================
# BM25 RETRIEVAL
# ============================================================

def _bm25_search(query: str, bm25: BM25Okapi, docs: list, k: int = MAX_CANDIDATES) -> List[Tuple]:
    """Retrieve top-k documents using BM25 keyword matching."""
    if bm25 is None or not docs:
        return []

    tokenized_query = query.lower().split()
    scores = bm25.get_scores(tokenized_query)

    # Pair docs with scores and sort descending
    doc_scores = [(docs[i], scores[i]) for i in range(len(docs)) if scores[i] > 0]
    doc_scores.sort(key=lambda x: x[1], reverse=True)

    return doc_scores[:k]


# ============================================================
# HYBRID RETRIEVAL (CORE)
# ============================================================

def _retrieve(
    db: FAISS,
    bm25: BM25Okapi,
    bm25_docs: list,
    query: str,
    search_type: str
) -> Dict:
    """
    Hybrid retrieval combining FAISS semantic search with BM25 keyword matching.
    Includes query expansion, deduplication, contextual compression, and
    confidence scoring.
    """
    try:
        expanded_queries = _expand_query(query)

        # --- FAISS semantic search ---
        semantic_candidates = {}  # content_key -> (doc, score)
        for q in expanded_queries:
            docs = db.similarity_search_with_score(q, k=MAX_CANDIDATES)
            for doc, score in docs:
                content_key = doc.page_content[:200]
                if content_key not in semantic_candidates or score < semantic_candidates[content_key][1]:
                    semantic_candidates[content_key] = (doc, score)

        # --- BM25 keyword search ---
        bm25_candidates = {}
        for q in expanded_queries:
            results = _bm25_search(q, bm25, bm25_docs)
            for doc, score in results:
                content_key = doc.page_content[:200]
                if content_key not in bm25_candidates or score > bm25_candidates[content_key][1]:
                    bm25_candidates[content_key] = (doc, score)

        # --- Normalize scores ---
        # FAISS: lower = better -> normalize to 0-1 where 1 = best
        if semantic_candidates:
            sem_scores = [s for _, s in semantic_candidates.values()]
            sem_min, sem_max = min(sem_scores), max(sem_scores)
            sem_range = sem_max - sem_min if sem_max != sem_min else 1.0
        else:
            sem_min, sem_range = 0, 1.0

        # BM25: higher = better -> normalize to 0-1 where 1 = best
        if bm25_candidates:
            bm25_scores = [s for _, s in bm25_candidates.values()]
            bm25_max = max(bm25_scores) if bm25_scores else 1.0
        else:
            bm25_max = 1.0

        # --- Merge with weighted scoring ---
        combined = {}  # content_key -> (doc, hybrid_score, original_faiss_score)
        all_keys = set(list(semantic_candidates.keys()) + list(bm25_candidates.keys()))

        for key in all_keys:
            sem_entry = semantic_candidates.get(key)
            bm25_entry = bm25_candidates.get(key)

            # Normalized semantic score (inverted: 1 = best match)
            if sem_entry:
                doc = sem_entry[0]
                raw_sem = sem_entry[1]
                norm_sem = 1.0 - ((raw_sem - sem_min) / sem_range) if sem_range > 0 else 1.0
            else:
                norm_sem = 0.0

            # Normalized BM25 score (already higher = better)
            if bm25_entry:
                doc = bm25_entry[0] if not sem_entry else doc
                norm_bm25 = bm25_entry[1] / bm25_max if bm25_max > 0 else 0.0
            else:
                norm_bm25 = 0.0

            hybrid_score = (SEMANTIC_WEIGHT * norm_sem) + (BM25_WEIGHT * norm_bm25)
            original_faiss = sem_entry[1] if sem_entry else SCORE_THRESHOLD + 1
            combined[key] = (doc, hybrid_score, original_faiss)

        if not combined:
            return {
                "status": "no_match",
                "query": query,
                "rag_confidence": "none",
                "context_string": (
                    "[RAG RETRIEVAL: NO MATCHES FOUND]\n"
                    f"No relevant documents found for: '{query}'.\n"
                    "Generate a complete response using domain knowledge.\n"
                    "Do not return an error or refuse to answer."
                ),
            }

        # Sort by hybrid score descending
        ranked = sorted(combined.values(), key=lambda x: x[1], reverse=True)

        # Apply FAISS score threshold for quality floor
        filtered = [(doc, hybrid, faiss_s) for doc, hybrid, faiss_s in ranked if faiss_s <= SCORE_THRESHOLD]

        if not filtered:
            return {
                "status": "low_confidence",
                "query": query,
                "rag_confidence": "low",
                "context_string": (
                    "[RAG RETRIEVAL: LOW CONFIDENCE]\n"
                    f"Results for '{query}' had low relevance scores.\n"
                    "Use domain knowledge as the primary source.\n"
                    "The following loosely related content may be supplementary:\n\n"
                    + _format_context_blocks([(d, f) for d, _, f in ranked[:3]])
                ),
            }

        # Deduplicate
        deduped = _deduplicate([(doc, hybrid) for doc, hybrid, _ in filtered])

        # Take top N
        top_docs_hybrid = deduped[:FINAL_CONTEXT_LIMIT]

        # Map back to FAISS scores for confidence assessment
        faiss_scores_map = {id(doc): faiss_s for doc, _, faiss_s in filtered}
        top_with_faiss = []
        for doc, hybrid in top_docs_hybrid:
            faiss_s = faiss_scores_map.get(id(doc), SCORE_THRESHOLD)
            top_with_faiss.append((doc, faiss_s))

        # Determine confidence level
        best_faiss = min(s for _, s in top_with_faiss)
        high_conf_count = sum(1 for _, s in top_with_faiss if s <= HIGH_CONFIDENCE_THRESHOLD)

        if high_conf_count >= 2:
            confidence = "high"
        elif best_faiss <= 1.0:
            confidence = "medium"
        else:
            confidence = "low"

        # Compress chunks and format context
        compressed_docs = []
        for doc, score in top_with_faiss:
            doc.page_content = _compress_chunk(doc.page_content)
            compressed_docs.append((doc, score))

        context_string = _format_context_blocks(compressed_docs)

        # Retrieval metadata header
        header = (
            f"[RAG RETRIEVAL: {confidence.upper()} CONFIDENCE | {len(compressed_docs)} matches | hybrid search]\n"
            f"Query: {query}\n"
            f"Best similarity score: {best_faiss:.3f} (lower = better)\n"
            f"Retrieval method: FAISS semantic ({SEMANTIC_WEIGHT}) + BM25 keyword ({BM25_WEIGHT})\n"
        )
        if confidence == "low":
            header += (
                "Low confidence results. Supplement heavily with domain knowledge.\n"
                "Use retrieved content only where it clearly aligns with the project.\n"
            )
        elif confidence == "medium":
            header += (
                "Moderately relevant results. Cross-reference with domain knowledge.\n"
            )
        else:
            header += (
                "High confidence match. Use retrieved content as the primary source.\n"
            )

        matches = []
        for doc, score in compressed_docs:
            meta = doc.metadata or {}
            matches.append({
                "score": float(score),
                "content": doc.page_content,
                "metadata": meta,
            })

        return {
            "status": "ok",
            "query": query,
            "type": search_type,
            "rag_confidence": confidence,
            "match_count": len(matches),
            "expanded_queries": expanded_queries,
            "matches": matches,
            "context_string": header + "\n" + context_string,
        }

    except Exception as e:
        logger.exception("Retrieval error")
        return {
            "status": "error",
            "query": query,
            "rag_confidence": "none",
            "context_string": (
                "[RAG RETRIEVAL: ERROR]\n"
                f"Retrieval failed: {str(e)}\n"
                "Generate a complete response using domain knowledge.\n"
                "Do not return an error or refuse to answer."
            ),
            "reason": str(e),
        }


def _format_context_blocks(docs_with_scores: list) -> str:
    """Format retrieved documents into structured context blocks for the LLM."""
    blocks = []
    for i, (doc, score) in enumerate(docs_with_scores):
        meta = doc.metadata or {}
        block = (
            f"--- RETRIEVED DOCUMENT {i+1} (score: {score:.3f}) ---\n"
            f"Project: {meta.get('title', 'unknown')}\n"
            f"Section: {meta.get('section', 'general')}\n"
        )
        url = meta.get("url", "")
        if url:
            block += f"Source: {url}\n"
        block += f"\n{doc.page_content}\n"
        blocks.append(block.strip())
    return "\n\n".join(blocks)


# ============================================================
# PUBLIC API
# ============================================================

def retrieve_content(query: str) -> Dict:
    """
    For project explanation, wiring, and troubleshooting agents.
    Hybrid search (semantic + keyword) against the content knowledge base.
    """
    return _retrieve(content_db, _content_bm25, _content_docs, query, "content")

def retrieve_code(query: str) -> Dict:
    """
    For code generation agent.
    Hybrid search (semantic + keyword) against the code knowledge base.
    """
    return _retrieve(code_db, _code_bm25, _code_docs, query, "code")

# ============================================================
# TEST
# ============================================================

if __name__ == "__main__":
    q = "gas leak detector arduino code"
    
    print("\n--- CODE SEARCH ---\n")
    res = retrieve_code(q)
    print(f"Confidence: {res.get('rag_confidence')}")
    print(res["context_string"])

    print("\n--- CONTENT SEARCH ---\n")
    res = retrieve_content(q)
    print(f"Confidence: {res.get('rag_confidence')}")
    print(res["context_string"])
